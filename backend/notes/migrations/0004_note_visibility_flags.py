from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("notes", "0003_note_is_published_note_published_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="note",
            name="visible_to_teacher",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="note",
            name="visible_to_coordinator",
            field=models.BooleanField(default=False),
        ),
    ]
