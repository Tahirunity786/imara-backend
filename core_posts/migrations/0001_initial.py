# Generated by Django 5.1 on 2024-09-27 06:09

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Cities',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('city_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('name', models.CharField(db_index=True, max_length=100)),
                ('image', models.ImageField(blank=True, db_index=True, default='cities/images/default.jpg', null=True, upload_to='cities/images')),
            ],
        ),
        migrations.CreateModel(
            name='HotelImages',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hotel_image_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('image', models.ImageField(db_index=True, upload_to='hotels/images')),
            ],
        ),
        migrations.CreateModel(
            name='ResturantImages',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('restaurant_image_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('image', models.ImageField(db_index=True, upload_to='restaurants/images')),
            ],
        ),
        migrations.CreateModel(
            name='ReviewType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('review_type_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('name', models.CharField(choices=[('Cleanliness', 'Cleanliness'), ('Accuracy of information', 'Accuracy of information'), ('Communication', 'Communication'), ('Reception team', 'Reception team'), ('Experience de check-in', 'Experience de check-in'), ('Value', 'Value')], db_index=True, max_length=100)),
                ('rate', models.DecimalField(decimal_places=2, max_digits=5)),
            ],
        ),
        migrations.CreateModel(
            name='Hotel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hotel_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('name', models.CharField(db_index=True, max_length=100)),
                ('description', models.TextField()),
                ('visitors', models.PositiveBigIntegerField(db_index=True, default=0)),
                ('country', models.CharField(db_index=True, max_length=100)),
                ('address', models.TextField()),
                ('phone_number', models.CharField(db_index=True, max_length=30)),
                ('email', models.EmailField(db_index=True, max_length=254, null=True)),
                ('website', models.URLField(blank=True)),
                ('company_registration_number', models.PositiveBigIntegerField(db_index=True)),
                ('city', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core_posts.cities')),
                ('images', models.ManyToManyField(blank=True, db_index=True, to='core_posts.hotelimages')),
            ],
        ),
        migrations.CreateModel(
            name='BedRoom',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('room_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('image', models.ImageField(db_index=True, null=True, upload_to='beds/images')),
                ('room_type', models.CharField(choices=[('single', 'Single'), ('double', 'Double'), ('suite', 'Suite')], db_index=True, max_length=100)),
                ('description', models.TextField(db_index=True)),
                ('price', models.PositiveIntegerField(default=0)),
                ('capacity', models.PositiveIntegerField(default=0)),
                ('room_amenities', models.CharField(db_index=True, max_length=100)),
                ('availability_from', models.DateField(default=None, null=True)),
                ('availability_till', models.DateField(default=None, null=True)),
                ('hotel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core_posts.hotel')),
            ],
        ),
        migrations.CreateModel(
            name='Restaurant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('restaurant_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('name', models.CharField(db_index=True, max_length=100)),
                ('description', models.TextField()),
                ('country', models.CharField(db_index=True, max_length=100)),
                ('address', models.TextField()),
                ('phone_number', models.CharField(db_index=True, max_length=30)),
                ('email', models.EmailField(db_index=True, max_length=254, unique=True)),
                ('website', models.URLField(blank=True)),
                ('company_registration_number', models.PositiveBigIntegerField(db_index=True)),
                ('city', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core_posts.cities')),
                ('images', models.ManyToManyField(blank=True, db_index=True, to='core_posts.resturantimages')),
            ],
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('review_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('comment', models.TextField(db_index=True)),
                ('date_of_notice', models.DateTimeField(auto_now_add=True)),
                ('restaurant', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='core_posts.restaurant')),
                ('room', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='core_posts.bedroom')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('rating', models.ManyToManyField(db_index=True, to='core_posts.reviewtype')),
            ],
        ),
        migrations.AddField(
            model_name='bedroom',
            name='reviews',
            field=models.ManyToManyField(blank=True, db_index=True, to='core_posts.review'),
        ),
        migrations.CreateModel(
            name='Tables',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('table_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('capacity', models.PositiveIntegerField(default=0)),
                ('availability_from', models.DateField(default=None, null=True)),
                ('availability_till', models.DateField(default=None, null=True)),
                ('restaurant', models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='core_posts.restaurant')),
            ],
        ),
        migrations.CreateModel(
            name='MenuItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dish_id', models.CharField(blank=True, db_index=True, max_length=100, null=True, unique=True)),
                ('name', models.CharField(db_index=True, max_length=100)),
                ('description', models.TextField(blank=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('category', models.CharField(choices=[('starter', 'Starter'), ('main_course', 'Main Course'), ('dessert', 'Dessert'), ('drink', 'Drink')], db_index=True, max_length=20)),
                ('restaurant', models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='core_posts.restaurant')),
                ('table', models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='core_posts.tables')),
            ],
        ),
    ]
