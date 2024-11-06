from django.views.generic import TemplateView

class AccountsView(TemplateView):
    template_name = 'utiles/Account.html'

class AccountsEmailNotificaationView(TemplateView):
    template_name = 'utiles/Email-notification.html'

class AccountsPersonalDetailView(TemplateView):
    template_name = 'utiles/pesonal-details.html'

class AccountsPreferencesView(TemplateView):
    template_name = 'utiles/preferences.html'

class AccountsPaymentDetailsView(TemplateView):
    template_name = 'utiles/Payment-detail.html'


class AccountsSecurityView(TemplateView):
    template_name = 'utiles/Security.html'

class AboutUsView(TemplateView):
    template_name = 'utiles/about.html'

class HotelView(TemplateView):
    template_name = 'utiles/hotels.html'

class BedDetailView(TemplateView):
    template_name = 'utiles/hotels-overview.html'

class TableDetailView(TemplateView):
    template_name = 'utiles/table-overview.html'

class ResturantView(TemplateView):
    template_name = 'utiles/restaurants.html'

class Cart(TemplateView):
    template_name = 'utiles/cart.html'

class SearchView(TemplateView):
    template_name = 'utiles/search.html'
    
class HotelSearchView(TemplateView):
    template_name = 'utiles/hotel-search.html'

class ResturantSearchView(TemplateView):
    template_name = 'utiles/resturant-search.html'

class MyList(TemplateView):
    template_name = 'utiles/my-booking.html'
    
class PaymentRenser(TemplateView):
    template_name = 'utiles/Payment.html'

class MainCart(TemplateView):
    template_name = 'utiles/cart-container.html'

class CityExplore(TemplateView):
    template_name = 'utiles/city-explore.html'


class ConfirmationView(TemplateView):
    template_name = 'utiles/confirmation-page.html'


