from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("notes", "0002_note_teacher_can_edit_note_updated_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="note",
            name="is_published",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="note",
            name="published_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

