# Generated by Django 4.2.16 on 2024-11-08 15:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Notifications', '0002_alter_notifications_link'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notifications',
            name='link',
            field=models.TextField(blank=True, max_length=200, null=True),
        ),
    ]
