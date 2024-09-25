import random
import string
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.models import Avg

User = get_user_model()

class Cities(models.Model):
    city_id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True)
    name = models.CharField(max_length=100, db_index=True)


    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.city_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.city_id = f'nak-{unique_str}'

        super(Cities, self).save(*args, **kwargs)

class HotelImages(models.Model):
    hotel_image_id = models.CharField(max_length=100, unique=True, db_index=True, default=None, null=True, blank=True)
    image = models.ImageField(upload_to="hotels/images", db_index=True)
    
    def __str__(self):
        return self.hotel_image_id
    
    def save(self, *args, **kwargs):
        if not self.hotel_image_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.hotel_image_id = f'nak-{unique_str}'

        super(HotelImages, self).save(*args, **kwargs)


class Hotel(models.Model):
    hotel_id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True)
    city = models.ForeignKey(Cities, on_delete=models.CASCADE, db_index=True, null=True, default="")
    images = models.ManyToManyField(HotelImages, db_index=True, default="")
    name = models.CharField(max_length=100, db_index=True)
    description = models.TextField()
    visitors = models.PositiveBigIntegerField(db_index=True, default=0)
    country = models.CharField(max_length=100, db_index=True)
    address = models.TextField()
    phone_number = models.CharField(max_length=30, db_index=True)
    email = models.EmailField(null=True, db_index=True)
    website = models.URLField(max_length=200, blank=True)
    company_registration_number = models.PositiveBigIntegerField(db_index=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.hotel_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.hotel_id = f'nak-{unique_str}'

        super(Hotel, self).save(*args, **kwargs)

class ResturantImages(models.Model):
    resturant_img_id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True)

    image = models.ImageField(upload_to="resturant/images", db_index=True)
    def save(self, *args, **kwargs):
        if not self.resturant_img_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.resturant_img_id = f'nak-{unique_str}'

        super(ResturantImages, self).save(*args, **kwargs)
    

class Restaurant(models.Model):
    resturant_id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True)
    city = models.ForeignKey(Cities, on_delete=models.CASCADE, null=True, db_index=True, default="")
    images = models.ManyToManyField(ResturantImages, db_index=True, default="")
    name = models.CharField(max_length=100, db_index=True)
    description = models.TextField()
    city = models.CharField(max_length=100, db_index=True)
    country = models.CharField(max_length=100, db_index=True)
    address = models.TextField()
    phone_number = models.CharField(max_length=15, db_index=True)
    email = models.EmailField(unique=True, db_index=True)
    website = models.URLField(max_length=200, blank=True)
    company_registration_number = models.PositiveBigIntegerField(db_index=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.resturant_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.resturant_id = f'nak-{unique_str}'
     
        super(Restaurant, self).save(*args, **kwargs)
    

class BedRoom(models.Model):

    ROOM_TYPE = (
        ('single', 'single'),
        ('double', 'double'),
        ('suite', 'suite'),
    )
    room_id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True)
    image = models.ImageField(upload_to="beds/images", db_index=True, default=None, null=True)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, db_index=True, default="")
    reviews = models.ManyToManyField('Review', db_index=True)
    room_type = models.CharField(max_length=100, choices=ROOM_TYPE, db_index=True)
    description = models.TextField(db_index=True)
    price = models.PositiveIntegerField(default=0)
    capacity = models.PositiveIntegerField(default=0)
    room_amenities =  models.CharField(max_length=100,  db_index=True)
    availabilty_from = models.DateField(null=True, default=None)
    availabilty_till = models.DateField(null=True, default=None)

    def save(self, *args, **kwargs):
        if not self.room_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.room_id = f'nak-{unique_str}'
  
        super(BedRoom, self).save(*args, **kwargs)

class Tables(models.Model):
    resturant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, default="", db_index=True)
    table_id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True)
    capacity = models.PositiveIntegerField(default=0)
    availabilty_from = models.DateField(null=True, default=None)
    availabilty_till = models.DateField(null=True, default=None)

    def save(self, *args, **kwargs):
        if not self.table_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.table_id = f'nak-{unique_str}'
  
        super(Tables, self).save(*args, **kwargs)


class MenuItem(models.Model):
    dish_id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True)
    resturant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, default="", db_index=True)
    name = models.CharField(max_length=100, db_index=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    CATEGORY_CHOICES = [
        ('starter', 'Starter'),
        ('main_course', 'Main Course'),
        ('dessert', 'Dessert'),
        ('drink', 'Drink'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, db_index=True)

    def __str__(self):
        return self.name
    def save(self, *args, **kwargs):
        if not self.dish_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.dish_id = f'nak-{unique_str}'
  
        super(MenuItem, self).save(*args, **kwargs)


class ReviewType(models.Model):
    TYPES = [
        ('Cleanliness', 'Cleanliness'),
        ('Accuracy of information', 'Accuracy of information'),
        ('Communication', 'Communication'),
        ('Reception team', 'Reception team'),
        ('Experience de check-in', 'Experience de check-in'),
        ('Value', 'Value'),
    ]
    review_type_id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True)
    name = models.CharField(max_length=100, choices=TYPES, db_index=True)
    rate = models.DecimalField(max_digits=5, decimal_places=2)

    def save(self, *args, **kwargs):
        if not self.review_type_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.review_type_id = f'nak-{unique_str}'
  
        super(ReviewType, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} - {self.rate}'


class Review(models.Model):
    review_id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, null=True, blank=True)
    room = models.ForeignKey(BedRoom, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.ManyToManyField(ReviewType, db_index=True)
    comment = models.TextField(db_index=True)
    date_of_notice = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Review {self.review_id} by {self.user}'
    
    def save(self, *args, **kwargs):
        if not self.review_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.review_id = f'nak-{unique_str}'
  
        super(Review, self).save(*args, **kwargs)

    # Method to calculate overall average rating for all review types combined
    @staticmethod
    def get_overall_average_rating():
        # Aggregate the average for all ratings in ReviewType
        overall_avg = ReviewType.objects.aggregate(average_rating=Avg('rate'))['average_rating']
        print(overall_avg)
        # Return the rounded average or None if no reviews exist
        return round(overall_avg, 2) if overall_avg else None
