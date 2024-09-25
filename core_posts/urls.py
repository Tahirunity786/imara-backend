from django.urls import path
from .views import HotelDetails, SpecificHotelDetail

urlpatterns = [
    path("sp-h-post/<str:post_id>/",SpecificHotelDetail.as_view()),
    path("h-post/",HotelDetails.as_view())
]
