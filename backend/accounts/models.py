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

    def __str__(self):
        return f"{self.username} ({self.role})"
