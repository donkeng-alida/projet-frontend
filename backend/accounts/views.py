from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import UserCreateSerializer, UserSerializer


class HealthCheckView(APIView):
    def get(self, request):
        return Response({"status": "ok", "service": "django-backend"})


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by("-id")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return super().get_permissions()
        return [AllowAny()]


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""

        if not username or not password:
            return Response({"detail": "Missing credentials."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active or not user.is_approved:
            return Response({"detail": "Account not approved."}, status=status.HTTP_403_FORBIDDEN)

        token, _ = Token.objects.get_or_create(user=user)
        full_name = f"{user.first_name} {user.last_name}".strip()

        return Response(
            {
                "token": token.key,
                "role": user.role,
                "username": user.username,
                "full_name": full_name,
            }
        )
