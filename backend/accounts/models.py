
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = "admin", "Admin"
        CELLULE_INFO = "cellule-info", "Cellule info"
        ENSEIGNANT = "enseignant", "Enseignant"
        COORDONNATEUR = "coordonnateur", "Coordonnateur"
        PARENT = "parent", "Parent"
        ETUDIANT = "etudiant", "Etudiant"

    role = models.CharField(max_length=32, choices=Roles.choices, default=Roles.ETUDIANT)
    is_approved = models.BooleanField(default=True)
    cycle = models.CharField(max_length=120, blank=True, default="")
    filiere = models.CharField(max_length=120, blank=True, default="")
    child_student = models.CharField(max_length=150, blank=True, default="")

    def __str__(self):
        return f"{self.username} ({self.role})"


class AuditEvent(models.Model):
    actor = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_events",
    )
    event_type = models.CharField(max_length=80)
    method = models.CharField(max_length=10, blank=True, default="")
    path = models.CharField(max_length=255, blank=True, default="")
    status_code = models.PositiveSmallIntegerField(default=0)
    message = models.CharField(max_length=255, blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        actor_label = self.actor.username if self.actor else "anonymous"
        return f"{self.event_type} [{self.status_code}] by {actor_label}"
