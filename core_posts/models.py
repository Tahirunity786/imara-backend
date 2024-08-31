import random
import string
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Hotel(models.Model):
    hotel_id = models.CharField(max_length=100, unique=True, db_index=True)
    image = models.ImageField(upload_to="hotels/images", db_index=True)
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
        if not self.hotel_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.hotel_id = f'nak-{unique_str}'

        super(Hotel, self).save(*args, **kwargs)
    
class Restaurant(models.Model):
    resturant_id = models.CharField(max_length=100, unique=True, db_index=True)
    image = models.ImageField(upload_to="hotels/images", db_index=True)
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
    room_id = models.CharField(max_length=100, unique=True, db_index=True)
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
    table_id = models.CharField(max_length=100, unique=True, db_index=True)
    capacity = models.PositiveIntegerField(default=0)
    availabilty_from = models.DateField(null=True, default=None)
    availabilty_till = models.DateField(null=True, default=None)

    def save(self, *args, **kwargs):
        if not self.table_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.table_id = f'nak-{unique_str}'
  
        super(Tables, self).save(*args, **kwargs)


class MenuItem(models.Model):
    dish_id = models.CharField(max_length=100, unique=True, db_index=True)
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

class Review(models.Model):
    review_id = models.CharField(max_length=100, unique=True, db_index=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(choices=[(i, f'{i} Star') for i in range(1, 6)])
    comment = models.TextField(blank=True)
    date_of_notice = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Review {self.review_id} by {self.user}'
    def save(self, *args, **kwargs):
        if not self.review_id:
            unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            self.review_id = f'nak-{unique_str}'
  
        super(MenuItem, self).save(*args, **kwargs)
