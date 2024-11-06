# Generated by Django 5.1 on 2024-10-07 12:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_posts', '0012_favouritelist'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='favouritelist',
            name='fav_bed',
        ),
        migrations.RemoveField(
            model_name='favouritelist',
            name='fav_table',
        ),
        migrations.AddField(
            model_name='favouritelist',
            name='fav_bed',
            field=models.ManyToManyField(db_index=True, default='', to='core_posts.bedroom'),
        ),
        migrations.AddField(
            model_name='favouritelist',
            name='fav_table',
            field=models.ManyToManyField(db_index=True, default='', to='core_posts.tables'),
        ),
    ]
