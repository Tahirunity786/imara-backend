from django.contrib import admin
from django.urls import path, include
from .views import RegisterView, RegisterProcessView, LoginView, IndexView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Worker Apis
    path('accounts/', include('core_control.urls')),  # Note: corrected 'acounts' to 'accounts'

    # Templates Rendering
    
    # Main Rendering
    path('', IndexView.as_view(), name='Home'),
    path('login', LoginView.as_view(), name='login'),
    path('register', RegisterView.as_view(), name='register'),
    path('register-process', RegisterProcessView.as_view(), name='register-processor'),
    # Apps Template rendering
    path('nakiese/', include('utiles.urls')),

    # App rendering
    path('account-control/', include('core_control.urls')),  # Changed the URL prefix to avoid conflict
]
