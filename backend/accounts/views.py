from django.conf import settings
from django.contrib.auth import authenticate
from django.db.models import Q
from django.utils.crypto import get_random_string
from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .audit import log_audit_event
from .models import User
from .serializers import AuditEventSerializer, UserAdminUpdateSerializer, UserCreateSerializer, UserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def coordinator_cycle(request):
    user = request.user
    # Adapte cette ligne selon ton modèle utilisateur
    cycle = getattr(user, 'cycle', None)
    return Response({'cycle': cycle})


def parse_boolish(value):
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def generate_user_password():
    allowed_chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return get_random_string(12, allowed_chars=allowed_chars)


def authenticate_with_identifier(request, identifier, password):
    user = authenticate(request, username=identifier, password=password)
    if user:
        return user
    if "@" not in identifier:
        return None
    mapped_user = User.objects.filter(email__iexact=identifier).first()
    if not mapped_user:
        return None
    return authenticate(request, username=mapped_user.username, password=password)


def has_admin_rights(user):
    return user.is_authenticated and (user.is_superuser or user.role == "admin")


def has_teacher_rights(user):
    return user.is_authenticated and (user.is_superuser or user.role in {"admin", "enseignant"})


def is_restricted_superuser_identity(user):
    normalized = (settings.SUPERUSER_LOGIN or "").strip().lower()
    if not normalized:
        return False
    username = (user.username or "").lower()
    email = (user.email or "").lower()
    return user.is_superuser and (username == normalized or email == normalized)


def is_reserved_superuser_identity_data(payload):
    normalized = (settings.SUPERUSER_LOGIN or "").strip().lower()
    if not normalized:
        return False
    username = str(payload.get("username") or "").strip().lower()
    email = str(payload.get("email") or "").strip().lower()
    return username == normalized or email == normalized


def get_reserved_superuser_account():
    normalized = (settings.SUPERUSER_LOGIN or "").strip().lower()
    if not normalized:
        return None
    return (
        User.objects.filter(is_superuser=True)
        .filter(Q(username__iexact=normalized) | Q(email__iexact=normalized))
        .order_by("id")
        .first()
    )


class UserListPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class AuditEventPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = "page_size"
    max_page_size = 100


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "django-backend"})


class AuditEventListView(generics.ListAPIView):
    serializer_class = AuditEventSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AuditEventPagination

    def get_queryset(self):
        from .models import AuditEvent

        queryset = AuditEvent.objects.select_related("actor").all().order_by("-id")
        event_type = (self.request.query_params.get("event_type") or "").strip()
        status_code = (self.request.query_params.get("status_code") or "").strip()
        q = (self.request.query_params.get("q") or "").strip()

        if event_type:
            queryset = queryset.filter(event_type__icontains=event_type)
        if status_code.isdigit():
            queryset = queryset.filter(status_code=int(status_code))
        if q:
            queryset = queryset.filter(
                Q(message__icontains=q)
                | Q(path__icontains=q)
                | Q(actor__username__icontains=q)
                | Q(actor__email__icontains=q)
            )
        return queryset

    def list(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response(
                {"detail": "Only superuser can view audit events."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().list(request, *args, **kwargs)


class UserListCreateView(generics.ListCreateAPIView):
    pagination_class = UserListPagination

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return super().get_permissions()
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = User.objects.all().order_by("-id")
        q = (self.request.query_params.get("q") or "").strip()
        role = (self.request.query_params.get("role") or "").strip()
        is_active = (self.request.query_params.get("is_active") or "").strip().lower()
        is_approved = (self.request.query_params.get("is_approved") or "").strip().lower()

        if q:
            queryset = queryset.filter(
                Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
                | Q(username__icontains=q)
                | Q(email__icontains=q)
                | Q(role__icontains=q)
                | Q(filiere__icontains=q)
                | Q(child_student__icontains=q)
            )

        if role:
            queryset = queryset.filter(role=role)
        if is_active in {"true", "false"}:
            queryset = queryset.filter(is_active=(is_active == "true"))
        if is_approved in {"true", "false"}:
            queryset = queryset.filter(is_approved=(is_approved == "true"))

        return queryset.order_by("-id")

    def list(self, request, *args, **kwargs):
        if not has_admin_rights(request.user):
            return Response(
                {"detail": "Only admin or superuser can list users."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        if not has_admin_rights(user):
            return Response(
                {"detail": "Only admin or superuser can create users."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if parse_boolish(request.data.get("is_superuser")) or parse_boolish(request.data.get("is_staff")):
            return Response(
                {"detail": "Superuser elevation is not allowed from this endpoint."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if is_reserved_superuser_identity_data(request.data):
            existing_reserved = get_reserved_superuser_account()
            if existing_reserved:
                return Response(
                    {"detail": "Reserved superuser identity is already assigned to another account."},
                    status=status.HTTP_409_CONFLICT,
                )
        if not user.is_superuser and is_reserved_superuser_identity_data(request.data):
            return Response(
                {"detail": "Only superuser can create the reserved superuser identity account."},
                status=status.HTTP_403_FORBIDDEN,
            )

        payload = request.data.copy()
        generated_password = generate_user_password()
        payload["password"] = generated_password

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        response_payload = dict(serializer.data)
        response_payload["generated_password"] = generated_password

        return Response(response_payload, status=status.HTTP_201_CREATED, headers=headers)


class StudentListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = UserListPagination

    def get_queryset(self):
        queryset = (
            User.objects.filter(role=User.Roles.ETUDIANT, is_active=True, is_approved=True)
            .order_by("-id")
        )

        q = (self.request.query_params.get("q") or "").strip()
        cycle = (self.request.query_params.get("cycle") or "").strip()
        filiere = (self.request.query_params.get("filiere") or "").strip()

        if cycle:
            queryset = queryset.filter(cycle__iexact=cycle)
        if filiere:
            queryset = queryset.filter(filiere__iexact=filiere)
        if q:
            queryset = queryset.filter(
                Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
                | Q(username__icontains=q)
                | Q(email__icontains=q)
            )

        return queryset

    def list(self, request, *args, **kwargs):
        if not has_teacher_rights(request.user):
            return Response(
                {"detail": "Only teacher, admin or superuser can list students."},
                status=status.HTTP_403_FORBIDDEN,
            )
        cycle = (request.query_params.get("cycle") or "").strip()
        if not cycle:
            return Response(
                {"detail": "cycle is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().list(request, *args, **kwargs)


class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserAdminUpdateSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        if not has_admin_rights(request.user):
            return Response(
                {"detail": "Only admin or superuser can update users."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if parse_boolish(request.data.get("is_superuser")) or parse_boolish(request.data.get("is_staff")):
            return Response(
                {"detail": "Superuser elevation is not allowed from this endpoint."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if not request.user.is_superuser and is_reserved_superuser_identity_data(request.data):
            return Response(
                {"detail": "Only superuser can assign the reserved superuser identity."},
                status=status.HTTP_403_FORBIDDEN,
            )
        target_user = self.get_object()
        if is_reserved_superuser_identity_data(request.data):
            existing_reserved = get_reserved_superuser_account()
            if existing_reserved and existing_reserved.id != target_user.id:
                return Response(
                    {"detail": "Reserved superuser identity is already assigned to another account."},
                    status=status.HTTP_409_CONFLICT,
                )
        if is_restricted_superuser_identity(target_user):
            blocked_fields = {"is_active", "is_approved", "role"}
            if any(field in request.data for field in blocked_fields):
                return Response(
                    {"detail": "Cannot change status or role of the restricted superuser account."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not has_admin_rights(request.user):
            return Response(
                {"detail": "Only admin or superuser can delete users."},
                status=status.HTTP_403_FORBIDDEN,
            )
        target_user = self.get_object()
        if request.user.id == target_user.id:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if is_restricted_superuser_identity(target_user):
            return Response(
                {"detail": "Cannot delete the restricted superuser account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""
        remote_addr = (request.META.get("HTTP_X_FORWARDED_FOR") or request.META.get("REMOTE_ADDR") or "").split(",")[0].strip()

        if not username or not password:
            log_audit_event(
                event_type="auth.login.failed",
                method="POST",
                path=request.path,
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Missing credentials.",
                metadata={"identifier": username, "remote_addr": remote_addr},
            )
            return Response({"detail": "Missing credentials."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate_with_identifier(request, username, password)
        if not user:
            log_audit_event(
                event_type="auth.login.failed",
                method="POST",
                path=request.path,
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Invalid credentials.",
                metadata={"identifier": username, "remote_addr": remote_addr},
            )
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active or not user.is_approved:
            log_audit_event(
                actor=user,
                event_type="auth.login.blocked",
                method="POST",
                path=request.path,
                status_code=status.HTTP_403_FORBIDDEN,
                message="Account not approved.",
                metadata={"identifier": username, "remote_addr": remote_addr},
            )
            return Response({"detail": "Account not approved."}, status=status.HTTP_403_FORBIDDEN)
        if is_restricted_superuser_identity(user):
            log_audit_event(
                actor=user,
                event_type="auth.login.blocked",
                method="POST",
                path=request.path,
                status_code=status.HTTP_403_FORBIDDEN,
                message="Restricted superuser must use dedicated endpoint.",
                metadata={"identifier": username, "remote_addr": remote_addr},
            )
            return Response(
                {"detail": "Restricted superuser must use /api/accounts/superuser/login/."},
                status=status.HTTP_403_FORBIDDEN,
            )

        token, _ = Token.objects.get_or_create(user=user)
        full_name = f"{user.first_name} {user.last_name}".strip()
        log_audit_event(
            actor=user,
            event_type="auth.login.success",
            method="POST",
            path=request.path,
            status_code=status.HTTP_200_OK,
            message="User login success.",
            metadata={"identifier": username, "remote_addr": remote_addr},
        )

        return Response(
            {
                "token": token.key,
                "role": user.role,
                "is_superuser": user.is_superuser,
                "username": user.username,
                "email": user.email,
                "full_name": full_name,
            }
        )


class SuperuserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""
        remote_addr = (request.META.get("HTTP_X_FORWARDED_FOR") or request.META.get("REMOTE_ADDR") or "").split(",")[0].strip()

        if not username or not password:
            log_audit_event(
                event_type="auth.superuser_login.failed",
                method="POST",
                path=request.path,
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Missing credentials.",
                metadata={"identifier": username, "remote_addr": remote_addr},
            )
            return Response({"detail": "Missing credentials."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate_with_identifier(request, username, password)
        if not user:
            log_audit_event(
                event_type="auth.superuser_login.failed",
                method="POST",
                path=request.path,
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Invalid credentials.",
                metadata={"identifier": username, "remote_addr": remote_addr},
            )
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active or not user.is_approved:
            log_audit_event(
                actor=user,
                event_type="auth.superuser_login.blocked",
                method="POST",
                path=request.path,
                status_code=status.HTTP_403_FORBIDDEN,
                message="Account not approved.",
                metadata={"identifier": username, "remote_addr": remote_addr},
            )
            return Response({"detail": "Account not approved."}, status=status.HTTP_403_FORBIDDEN)

        normalized = (settings.SUPERUSER_LOGIN or "").strip().lower()
        if not normalized:
            return Response(
                {"detail": "Server misconfiguration: SUPERUSER_LOGIN is missing."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        is_allowed_identity = (
            (user.username or "").lower() == normalized or (user.email or "").lower() == normalized
        )
        if not user.is_superuser or not is_allowed_identity:
            log_audit_event(
                actor=user if getattr(user, "is_authenticated", False) else None,
                event_type="auth.superuser_login.blocked",
                method="POST",
                path=request.path,
                status_code=status.HTTP_403_FORBIDDEN,
                message="Access denied: restricted superuser account.",
                metadata={"identifier": username, "remote_addr": remote_addr},
            )
            return Response(
                {"detail": "Access denied: restricted superuser account."},
                status=status.HTTP_403_FORBIDDEN,
            )

        token, _ = Token.objects.get_or_create(user=user)
        full_name = f"{user.first_name} {user.last_name}".strip()
        log_audit_event(
            actor=user,
            event_type="auth.superuser_login.success",
            method="POST",
            path=request.path,
            status_code=status.HTTP_200_OK,
            message="Superuser login success.",
            metadata={"identifier": username, "remote_addr": remote_addr},
        )

        return Response(
            {
                "token": token.key,
                "role": user.role,
                "is_superuser": user.is_superuser,
                "username": user.username,
                "email": user.email,
                "full_name": full_name,
            }
        )
