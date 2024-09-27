from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import Response
from django.db import transaction
from django.core.cache import cache
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from core_posts.models import BedRoom, Cities, Tables, MenuItem
from core_posts.serializers import DetailBedSerializer, AllBedSerializer, CitySerializer, DetailTableSerializer, MenuSerializers, TableSerializer



class HotelDetails(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # First, check if the hotel data is cached
        cache_key = 'all_hotel'
        response = cache.get(cache_key)

        if response is None:
            hotels = BedRoom.objects.all()[:20]
            cities = Cities.objects.all()
            print(hotels)
            # Serialize the hotel and city data
            hotel_serializer = AllBedSerializer(hotels, many=True)
            city_serializer = CitySerializer(cities, many=True)

            # Access the `.data` to convert them into JSON-serializable dicts
            hotel_data = hotel_serializer.data
            city_data = city_serializer.data

            # Prepare the final response
            response = {
                "hotel_data": hotel_data,
                'cities': city_data
            }

            # Cache the result for 10 minutes
            cache.set(cache_key, response, timeout=600)

        # Return the cached or freshly serialized data
        return Response(response, status=status.HTTP_200_OK)
    

class ResturantDetails(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # First, check if the hotel data is cached
        cache_key = 'all_resturant'
        response = cache.get(cache_key)

        if response is None:
            tables = Tables.objects.all()[:20]
            cities = Cities.objects.all()
            
            # Serialize the hotel and city data
            table_serializer = TableSerializer(tables, many=True)
            city_serializer = CitySerializer(cities, many=True)

            # Access the `.data` to convert them into JSON-serializable dicts
            hotel_data = table_serializer.data
            city_data = city_serializer.data

            # Prepare the final response
            response = {
                "table_data": hotel_data,
                'cities': city_data
            }

            # Cache the result for 10 minutes
            cache.set(cache_key, response, timeout=600)

        # Return the cached or freshly serialized data
        return Response(response, status=status.HTTP_200_OK)


# Specific post agent
class SpecificHotelDetail(APIView):
    """
    API View to retrieve details of a specific hotel by its post_id.
    Sends all bed objects along with the specified bed detail.
    Caches the result for better performance with repeated requests.
    Requires user to be authenticated.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, post_id):
        # Cache key for the specific hotel data
        cache_key = f'hotel_{post_id}'
        hotel_data = cache.get(cache_key)

        if hotel_data is None:
            # Fetch the specific bed by its room_id
            bed = get_object_or_404(BedRoom, room_id=post_id)
            hotel = bed.hotel  # Get the hotel object linked to the bed

            # Fetch all bed objects related to the same hotel, excluding the specific bed
            all_beds = BedRoom.objects.filter(hotel=hotel).exclude(id=bed.id)

            # Serialize the specific bed and all remaining related beds
            specific_bed_serializer = DetailBedSerializer(bed)
            all_beds_serializer = AllBedSerializer(all_beds, many=True)

            # Prepare the response data
            hotel_data = {
                'specific_bed': specific_bed_serializer.data,
                'all_beds': all_beds_serializer.data
            }

            # Cache the result to optimize repeated queries
            cache.set(cache_key, hotel_data, timeout=600)

        # Return cached or freshly serialized data
        return Response(hotel_data, status=200)
    
# Specific Table post agent
class SpecificTableDetail(APIView):
    """
    API View to retrieve details of a specific hotel by its post_id.
    Sends all bed objects along with the specified bed detail.
    Caches the result for better performance with repeated requests.
    Requires user to be authenticated.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, post_id):
        # Cache key for the specific hotel data
        cache_key = f'hotel_{post_id}'
        table_data = cache.get(cache_key)

        if table_data is None:
            # Fetch the specific bed by its room_id
            table = get_object_or_404(Tables, table_id=post_id)

            all_menu = MenuItem.objects.filter(table=table)
            
            # Serialize the specific bed and all remaining related beds
            specific_bed_serializer = DetailTableSerializer(table)

            menu_of_table = MenuSerializers(all_menu, many=True)

            # Prepare the response data
            table_data = {
                'specific_table': specific_bed_serializer.data,
                'menu': menu_of_table.data,

            }

            # Cache the result to optimize repeated queries
            cache.set(cache_key, table_data, timeout=600)

        # Return cached or freshly serialized data
        return Response(table_data, status=200)
