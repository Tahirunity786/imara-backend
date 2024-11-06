from django.urls import path

from core_payments.views import CreatePaymentIntent

urlpatterns = [
    path('create-intent', CreatePaymentIntent.as_view())
]
