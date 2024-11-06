from django.urls import path
from .views import  AccountsEmailNotificaationView, CityExplore, ConfirmationView,HotelSearchView, MainCart, ResturantSearchView, AboutUsView, BedDetailView, Cart, MyList, PaymentRenser,ResturantView, AccountsView,AccountsSecurityView,AccountsPaymentDetailsView, AccountsPersonalDetailView, AccountsPreferencesView, HotelView, SearchView, TableDetailView
urlpatterns = [
    path('accounts/settings', AccountsView.as_view(), name="utiles"),
    path('accounts/settings/email-notification', AccountsEmailNotificaationView.as_view(), name="notification"),
    path('accounts/settings/persoanl-details', AccountsPersonalDetailView.as_view(), name="personal-detail"),
    path('accounts/settings/preferences', AccountsPreferencesView.as_view(), name="preferences"),
    path('accounts/settings/payment-handle', AccountsPaymentDetailsView.as_view(), name="payment-handle"),
    path('accounts/settings/security', AccountsSecurityView.as_view(), name="security"),
    
    path('about-us', AboutUsView.as_view(), name="aboutsus"),
    path('hotels', HotelView.as_view(), name="hotels"),
    path('hotel/bed-detail/<str:pro_id>', BedDetailView.as_view(), name="bed-detail"),
    path('resturant/table/<str:pro_id>', TableDetailView.as_view(), name="table-detail"),
    path('resturants', ResturantView.as_view(), name="resturant"),
    path('cart', MainCart.as_view(), name="cart"),
    path('Hébergements', SearchView.as_view(), name="search"),


    path('booking-list', MyList.as_view(), name="list"),
    path('payment', PaymentRenser.as_view(), name="payment"),
    path('search-h', HotelSearchView.as_view(), name="hotel-search"),
    path('search-res', ResturantSearchView.as_view(), name="res-search"),
    path('city/explore', CityExplore.as_view(), name="exp-city"),
    path('confirmation', ConfirmationView.as_view(), name="confirm"),
]
