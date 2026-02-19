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
            "note",
            "created_at",
        ]
        read_only_fields = ["id", "teacher", "teacher_username", "created_at"]

    def get_teacher_username(self, obj):
        return getattr(obj.teacher, "username", "")
