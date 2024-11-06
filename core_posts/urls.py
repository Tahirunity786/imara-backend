from django.urls import path
from .views import  CarSerializeView, CartRoomAgentView, CartTableAgentView, CityExploreView, CityListView, FavouriteListCreateView, FavouriteListDetailView, FavouriteListRetrieveView, HotelDetails,BedRoomListView, PaymentDetailCartSerializeView, PriceProviderView, ShareableLinkView, SpecificHotelDetail, ResturantDetails, SpecificTableDetail, TablePriceProviderView, TablesListView

urlpatterns = [
    path("sp-h-post/<str:post_id>/",SpecificHotelDetail.as_view()),
    path("sp-t-post/<str:post_id>/",SpecificTableDetail.as_view()),
    path("h-post/",HotelDetails.as_view()),
    path("t-post/",ResturantDetails.as_view()),

    # Search Mechanism
    path('search/hotel', BedRoomListView.as_view()),
    path('search/resturant', TablesListView.as_view()),

    # Share mechanism
    path('shareable-link/<str:room_id>/', ShareableLinkView.as_view(), name='generate_shareable_link'),

    # Favourite Mechanism
    path('favourites/', FavouriteListCreateView.as_view(), name='favourite-create'),
    path('favourites/user/', FavouriteListDetailView.as_view(), name='favourite-list'),
    path('favourites/<str:fav_id>/', FavouriteListRetrieveView.as_view(), name='favourite-retrieve'),
    
    # City Explore
    path('city-explore-view', CityExploreView.as_view(), name='city-exp'),
    path('city-all', CityListView.as_view(), name='city-all'),

    # Price provider
    path('price', PriceProviderView.as_view(), name='price'),
    path('table-price', TablePriceProviderView.as_view(), name='table'),

    # Cart agent 
    path('cart/room', CartRoomAgentView.as_view(), name='cart'),
    path('cart/table', CartTableAgentView.as_view(), name='cart-table'),

    # Here is cart serializer
    path('cart/serialize', CarSerializeView.as_view(), name='cart-serialize'),
    path('detail-cart/serialize', PaymentDetailCartSerializeView.as_view(), name='cart-serialize'),

]
