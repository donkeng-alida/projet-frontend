from decimal import Decimal, InvalidOperation

from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Note
from .serializers import NoteSerializer


class NotesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = getattr(request.user, "role", "")
        if role == "admin":
            notes = Note.objects.all().order_by("-created_at")[:500]
        elif role == "coordonnateur":
            cycle = getattr(request.user, "cycle", "") or ""
            if not cycle:
                return Response(
                    {"detail": "Coordinator cycle is missing."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            notes = Note.objects.filter(cycle=cycle).order_by("-created_at")[:500]
        elif role == "enseignant":
            notes = Note.objects.filter(teacher=request.user).order_by("-created_at")[:200]
        else:
            return Response(
                {"detail": "Access denied."},
                status=status.HTTP_403_FORBIDDEN,
            )
        paginator = PageNumberPagination()
        paginator.page_size = min(
            int(request.query_params.get("page_size", 50)),
            200,
        )
        paginated = paginator.paginate_queryset(notes, request)
        serializer = NoteSerializer(paginated, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        if getattr(request.user, "role", "") != "enseignant":
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
