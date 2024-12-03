from django.contrib import admin
from core_payments.models import Order, OrderItem, OrderPlacementStorage
# Register your models here.

admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(OrderPlacementStorage)