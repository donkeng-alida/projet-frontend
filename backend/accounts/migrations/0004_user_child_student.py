from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0003_user_filiere"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="child_student",
            field=models.CharField(blank=True, default="", max_length=150),
        ),
    ]

