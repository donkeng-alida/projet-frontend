from rest_framework import serializers

from .models import StudentRequest


class StudentRequestSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = StudentRequest
        fields = [
            "id",
            "student",
            "student_username",
            "cycle",
            "filiere",
            "subject",
            "justification",
            "attachment",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "student", "student_username", "status", "created_at", "updated_at"]

    def validate_attachment(self, value):
        name = (value.name or "").lower()
        content_type = (getattr(value, "content_type", "") or "").lower()
        if not name.endswith(".pdf"):
            raise serializers.ValidationError("Le justificatif doit etre un fichier PDF.")
        if content_type and content_type != "application/pdf":
            raise serializers.ValidationError("Type de fichier invalide. PDF requis.")
        return value

