from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_cycle"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="filiere",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
    ]

