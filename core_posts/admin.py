from django.contrib import admin
from .models import Hotel, BedRoom, Restaurant, Tables, MenuItem
# Register your models here.MenuItem

admin.site.register(Hotel)
admin.site.register(BedRoom)
admin.site.register(Restaurant)
admin.site.register(Tables)
admin.site.register(MenuItem)