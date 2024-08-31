from django.urls import path
from .views import  AccountsEmailNotificaationView,AboutUsView,ResturantView, AccountsView,AccountsSecurityView,AccountsPaymentDetailsView, AccountsPersonalDetailView, AccountsPreferencesView, HotelView
urlpatterns = [
    path('accounts/settings', AccountsView.as_view(), name="utiles"),
    path('accounts/settings/email-notification', AccountsEmailNotificaationView.as_view(), name="notification"),
    path('accounts/settings/persoanl-details', AccountsPersonalDetailView.as_view(), name="personal-detail"),
    path('accounts/settings/preferences', AccountsPreferencesView.as_view(), name="preferences"),
    path('accounts/settings/payment-handle', AccountsPaymentDetailsView.as_view(), name="payment-handle"),
    path('accounts/settings/security', AccountsSecurityView.as_view(), name="security"),
    
    path('about-us', AboutUsView.as_view(), name="aboutsus"),
    path('hotels', HotelView.as_view(), name="hotels"),
    path('resturants', ResturantView.as_view(), name="resturant")
]
