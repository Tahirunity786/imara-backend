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

class ResturantView(TemplateView):
    template_name = 'utiles/restaurants.html'


