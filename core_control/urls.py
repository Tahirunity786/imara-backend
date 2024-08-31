from django.urls import path
from .views import Register, UserLogin,ProfileView, EmailChecker, UpdateProfileView
urlpatterns = [
    path('user/create', Register.as_view(), name='user-create'),  # Add .as_view() here
    path('user/login', UserLogin.as_view(), name='user-login'),   # Add .as_view() here
    path('user/email-checker', EmailChecker.as_view(), name='email-checker'),  # Add .as_view() here and fix typo
    path('user/profile', ProfileView.as_view(), name='email-checker'),  # Add .as_view() here and fix typo
    path('user/profile/update', UpdateProfileView.as_view(), name='Update'),  # Add .as_view() here and fix typo
]