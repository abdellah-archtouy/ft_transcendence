# Generated by Django 4.2.16 on 2024-11-04 08:53

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('Notifications', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notifications',
            name='sender',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notification_sender', to=settings.AUTH_USER_MODEL),
        ),
    ]
