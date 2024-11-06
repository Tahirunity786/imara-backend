# Generated by Django 5.1 on 2024-10-07 12:14

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_posts', '0011_alter_bedroom_room_amenities'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='FavouriteList',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateField(auto_created=True, default=None)),
                ('name', models.CharField(db_index=True, default='', max_length=100)),
                ('favourite_list_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('fav_bed', models.ForeignKey(blank=True, default='', null=True, on_delete=django.db.models.deletion.CASCADE, to='core_posts.bedroom')),
                ('fav_table', models.ForeignKey(blank=True, default='', null=True, on_delete=django.db.models.deletion.CASCADE, to='core_posts.tables')),
                ('user', models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
