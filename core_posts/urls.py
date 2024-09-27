from django.urls import path
from .views import HotelDetails, SpecificHotelDetail, ResturantDetails, SpecificTableDetail

urlpatterns = [
    path("sp-h-post/<str:post_id>/",SpecificHotelDetail.as_view()),
    path("sp-t-post/<str:post_id>/",SpecificTableDetail.as_view()),
    path("h-post/",HotelDetails.as_view()),
    path("t-post/",ResturantDetails.as_view())
]
