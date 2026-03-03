from django.conf import settings
from django.db import models


class StudentRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_requests",
    )
    cycle = models.CharField(max_length=120)
    filiere = models.CharField(max_length=120)
    subject = models.CharField(max_length=180)
    justification = models.TextField()
    attachment = models.FileField(upload_to="justificatifs/%Y/%m/")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subject} - {self.student.username}"

