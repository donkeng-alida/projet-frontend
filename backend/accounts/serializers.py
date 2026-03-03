from django.conf import settings
from django.db.models import Q
from rest_framework import serializers

from .models import AuditEvent, User


def get_restricted_superuser():
    normalized = (settings.SUPERUSER_LOGIN or "").strip().lower()
    if not normalized:
        return None
    return (
        User.objects.filter(is_superuser=True)
        .filter(Q(username__iexact=normalized) | Q(email__iexact=normalized))
        .first()
    )


def enforce_admin_superuser_password_separation(raw_password, *, target_role, instance=None):
    if not raw_password:
        return
    restricted_superuser = get_restricted_superuser()
    if not restricted_superuser:
        return

    is_restricted_superuser_target = bool(instance and instance.pk == restricted_superuser.pk)
    is_admin_target = target_role == User.Roles.ADMIN

    if is_admin_target and not is_restricted_superuser_target:
        if restricted_superuser.check_password(raw_password):
            raise serializers.ValidationError(
                {"password": "Admin password must be different from the restricted superuser password."}
            )

    if is_restricted_superuser_target:
        other_admins = User.objects.filter(role=User.Roles.ADMIN).exclude(pk=restricted_superuser.pk)
        for admin_user in other_admins:
            if admin_user.check_password(raw_password):
                raise serializers.ValidationError(
                    {"password": "Restricted superuser password must be different from all admin passwords."}
                )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "cycle",
            "filiere",
            "child_student",
            "is_active",
            "is_approved",
            "date_joined",
        ]
        read_only_fields = ["id", "is_active", "is_approved", "date_joined"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "role", "cycle", "filiere", "child_student", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        target_role = validated_data.get("role", User.Roles.ETUDIANT)
        enforce_admin_superuser_password_separation(password, target_role=target_role)
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserAdminUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = User
        fields = ["email", "is_active", "is_approved", "role", "cycle", "filiere", "child_student", "password"]

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        target_role = validated_data.get("role", instance.role)
        if password:
            enforce_admin_superuser_password_separation(
                password,
                target_role=target_role,
                instance=instance,
            )
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class AuditEventSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True)
    actor_role = serializers.CharField(source="actor.role", read_only=True)

    class Meta:
        model = AuditEvent
        fields = [
            "id",
            "event_type",
            "method",
            "path",
            "status_code",
            "message",
            "metadata",
            "created_at",
            "actor_username",
            "actor_role",
        ]
