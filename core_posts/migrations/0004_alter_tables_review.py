# Generated by Django 5.1 on 2024-09-27 06:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_posts', '0003_remove_review_restaurant_review_tables_of_resturant'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tables',
            name='review',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='core_posts.review'),
        ),
    ]
