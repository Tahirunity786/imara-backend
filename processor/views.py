from django.views.generic import TemplateView

class LoginView(TemplateView):
    template_name = 'login.html'

class RegisterView(TemplateView):
    template_name = 'sign-up.html'

class RegisterProcessView(TemplateView):
    template_name = 'Sign-up-pros.html'

class IndexView(TemplateView):
    template_name = 'index.html'

