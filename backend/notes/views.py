from decimal import Decimal, InvalidOperation

from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Note
from .serializers import NoteSerializer


def coordinator_can_access_note(user, note):
    filiere = (getattr(user, "filiere", "") or "").strip().lower()
    if not filiere:
        return False
    filieres = note.filieres if isinstance(note.filieres, list) else []
    return any(str(item).strip().lower() == filiere for item in filieres)


class NotesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = getattr(request.user, "role", "")
        if request.user.is_superuser:
            return Response(
                {"detail": "Access denied."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if role == "admin":
            notes = Note.objects.all().order_by("-created_at")[:500]
        elif role == "coordonnateur":
            filiere = (getattr(request.user, "filiere", "") or "").strip()
            if not filiere:
                return Response(
                    {"detail": "Coordinator filiere is missing."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Notes store tracks in a JSON list; filter in Python for robust case-insensitive matching.
            notes = [
                note
                for note in Note.objects.all().order_by("-created_at")[:500]
                if note.visible_to_coordinator
                and isinstance(note.filieres, list)
                and any(str(item).strip().lower() == filiere.lower() for item in note.filieres)
            ]
        elif role == "enseignant":
            notes = Note.objects.filter(
                teacher=request.user, visible_to_teacher=True
            ).order_by("-created_at")[:200]
        elif role == "cellule-info":
            notes = Note.objects.filter(teacher_can_edit=True).order_by("-updated_at", "-created_at")[:500]
        elif role == "etudiant":
            identifiers = {
                (request.user.username or "").strip(),
                (request.user.email or "").strip(),
                (f"{request.user.first_name} {request.user.last_name}" or "").strip(),
                (request.user.first_name or "").strip(),
                (request.user.last_name or "").strip(),
            }
            identifiers = {item for item in identifiers if item}
            if not identifiers:
                return Response(
                    {"detail": "Student identity is missing."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            query = Q()
            for value in identifiers:
                query |= Q(etudiant__iexact=value)
            notes = Note.objects.filter(query, is_published=True).order_by("-created_at")[:200]
        elif role == "parent":
            child_student = (getattr(request.user, "child_student", "") or "").strip()
            if not child_student:
                return Response(
                    {"detail": "Parent child_student is missing."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            notes = Note.objects.filter(etudiant__iexact=child_student, is_published=True).order_by("-created_at")[:200]
        else:
            return Response(
                {"detail": "Access denied."},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            page_size = int(request.query_params.get("page_size", 50))
        except (TypeError, ValueError):
            page_size = 50
        page_size = min(max(page_size, 1), 200)
        paginator = PageNumberPagination()
        paginator.page_size = page_size
        paginated = paginator.paginate_queryset(notes, request)
        serializer = NoteSerializer(paginated, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        role = getattr(request.user, "role", "")
        if request.user.is_superuser:
            return Response(
                {"detail": "Access denied."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if role not in {"enseignant", "admin"}:
            return Response(
                {"detail": "Access denied."},
                status=status.HTTP_403_FORBIDDEN,
            )

        payload = request.data or {}
        cycle = (payload.get("cycle") or "").strip()
        filieres = payload.get("filieres") or []
        notes_data = payload.get("notes") or {}

        if not cycle or not isinstance(filieres, list) or not isinstance(notes_data, dict):
            return Response(
                {"detail": "Invalid payload."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        notes_to_create = []
        for matiere, etudiants in notes_data.items():
            if not isinstance(etudiants, dict):
                continue
            for etudiant, note_value in etudiants.items():
                if note_value in ("", None):
                    continue
                try:
                    note_decimal = Decimal(str(note_value))
                except (InvalidOperation, ValueError):
                    continue
                notes_to_create.append(
                    Note(
                        teacher=request.user,
                        cycle=cycle,
                        filieres=filieres,
                        matiere=str(matiere),
                        etudiant=str(etudiant),
                        note=note_decimal,
                    )
                )

        if not notes_to_create:
            return Response(
                {"detail": "No valid notes to save."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Note.objects.bulk_create(notes_to_create)
        return Response({"count": len(notes_to_create)}, status=status.HTTP_201_CREATED)


class NoteDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, note_id):
        role = getattr(request.user, "role", "")
        if request.user.is_superuser:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        note = Note.objects.filter(pk=note_id).first()
        if not note:
            return Response({"detail": "Note not found."}, status=status.HTTP_404_NOT_FOUND)

        is_admin = role == "admin"
        is_coordinator = role == "coordonnateur" and coordinator_can_access_note(request.user, note)
        is_teacher_owner = role == "enseignant" and note.teacher_id == request.user.id
        is_cellule_info = role == "cellule-info"

        if not (is_admin or is_coordinator or is_teacher_owner or is_cellule_info):
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        payload = request.data or {}
        allowed_fields = set()
        if is_admin:
            allowed_fields = {
                "note",
                "teacher_can_edit",
                "visible_to_teacher",
                "visible_to_coordinator",
                "is_published",
            }
        elif is_coordinator:
            allowed_fields = {"note", "teacher_can_edit"}
        elif is_cellule_info:
            if not note.teacher_can_edit:
                return Response(
                    {"detail": "Cellule-info edit is not allowed for this note."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            allowed_fields = {"note"}
        elif is_teacher_owner:
            if not note.teacher_can_edit:
                return Response(
                    {"detail": "Teacher edit is not allowed for this note."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            allowed_fields = {"note"}

        touched = []
        if "note" in payload and "note" in allowed_fields:
            try:
                note_decimal = Decimal(str(payload.get("note")))
            except (InvalidOperation, ValueError, TypeError):
                return Response({"detail": "Invalid note value."}, status=status.HTTP_400_BAD_REQUEST)
            note.note = note_decimal
            touched.append("note")

        if "teacher_can_edit" in payload and "teacher_can_edit" in allowed_fields:
            note.teacher_can_edit = bool(payload.get("teacher_can_edit"))
            touched.append("teacher_can_edit")

        if "visible_to_teacher" in payload and "visible_to_teacher" in allowed_fields:
            note.visible_to_teacher = bool(payload.get("visible_to_teacher"))
            touched.append("visible_to_teacher")

        if "visible_to_coordinator" in payload and "visible_to_coordinator" in allowed_fields:
            note.visible_to_coordinator = bool(payload.get("visible_to_coordinator"))
            touched.append("visible_to_coordinator")

        if "is_published" in payload and "is_published" in allowed_fields:
            is_published = bool(payload.get("is_published"))
            note.is_published = is_published
            note.published_at = timezone.now() if is_published else None
            touched.append("is_published")
            touched.append("published_at")

        if not touched:
            return Response({"detail": "No editable fields provided."}, status=status.HTTP_400_BAD_REQUEST)

        if is_teacher_owner:
            note.teacher_can_edit = False
            if "teacher_can_edit" not in touched:
                touched.append("teacher_can_edit")

        note.save(update_fields=[*set(touched), "updated_at"])
        serializer = NoteSerializer(note)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotePublishView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        role = getattr(request.user, "role", "")
        if request.user.is_superuser:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        if role == "admin":
            queryset = Note.objects.filter(is_published=False)
        elif role == "coordonnateur":
            filiere = (getattr(request.user, "filiere", "") or "").strip().lower()
            if not filiere:
                return Response(
                    {"detail": "Coordinator filiere is missing."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            queryset = [
                note
                for note in Note.objects.filter(is_published=False).order_by("-created_at")[:1000]
                if isinstance(note.filieres, list)
                and any(str(item).strip().lower() == filiere for item in note.filieres)
            ]
        else:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        if isinstance(queryset, list):
            if not queryset:
                return Response({"updated": 0}, status=status.HTTP_200_OK)
            ids = [note.id for note in queryset]
            updated = Note.objects.filter(id__in=ids, is_published=False).update(
                is_published=True,
                published_at=now,
            )
            return Response({"updated": updated}, status=status.HTTP_200_OK)

        updated = queryset.update(is_published=True, published_at=now)
        return Response({"updated": updated}, status=status.HTTP_200_OK)
