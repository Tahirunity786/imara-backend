from django.urls import path
from .views import HotelDetails,BedRoomListView, ShareableLinkView, SpecificHotelDetail, ResturantDetails, SpecificTableDetail

urlpatterns = [
    path("sp-h-post/<str:post_id>/",SpecificHotelDetail.as_view()),
    path("sp-t-post/<str:post_id>/",SpecificTableDetail.as_view()),
    path("h-post/",HotelDetails.as_view()),
    path("t-post/",ResturantDetails.as_view()),

    # Search Mechanism
    path('search/hotel', BedRoomListView.as_view()),

    # Share mechanism
    path('shareable-link/<str:room_id>/', ShareableLinkView.as_view(), name='generate_shareable_link'),

]
