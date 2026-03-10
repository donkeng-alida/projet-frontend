from rest_framework import serializers

from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    teacher_username = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            "id",
            "teacher",
            "teacher_username",
            "cycle",
            "filieres",
            "matiere",
            "etudiant",
            "note_type",
            "note",
            "teacher_can_edit",
            "visible_to_teacher",
            "visible_to_coordinator",
            "is_published",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "teacher", "teacher_username", "created_at", "updated_at"]

    def get_teacher_username(self, obj):
        return getattr(obj.teacher, "username", "")
