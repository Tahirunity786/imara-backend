# Generated by Django 5.1 on 2024-09-27 09:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_posts', '0004_alter_tables_review'),
    ]

    operations = [
        migrations.AddField(
            model_name='tables',
            name='images',
            field=models.ImageField(db_index=True, default=None, upload_to='table/images'),
        ),
    ]
