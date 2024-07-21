# Generated by Django 4.2.14 on 2024-07-20 12:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('User', '0004_alter_user_avatar_alter_user_cover'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, default='avatars/default.png', null=True, upload_to='avatars/'),
        ),
        migrations.AlterField(
            model_name='user',
            name='cover',
            field=models.ImageField(blank=True, default='covers/default.jpeg', null=True, upload_to='covers/'),
        ),
    ]
