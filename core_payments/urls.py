from django.urls import path

from core_payments.views import CreatePaymentIntent,OrderPlacer

urlpatterns = [
    path('create-intent', CreatePaymentIntent.as_view()),
    path('success', OrderPlacer.as_view())
]
