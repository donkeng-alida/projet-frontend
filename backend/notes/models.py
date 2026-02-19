from django.conf import settings
from django.db import models


class Note(models.Model):
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes"
    )
    cycle = models.CharField(max_length=120)
    filieres = models.JSONField(default=list, blank=True)
    matiere = models.CharField(max_length=120)
    etudiant = models.CharField(max_length=120)
    note = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.matiere} - {self.etudiant} ({self.note})"
