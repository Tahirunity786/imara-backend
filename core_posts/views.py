from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import Response
from django.db import transaction
from django.core.cache import cache
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import generics
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from django.utils.dateparse import parse_date
from django_filters import rest_framework as filters
from core_posts.models import BedRoom, Cities, Tables, MenuItem
from core_posts.serializers import DetailBedSerializer, AllBedSerializer, CitySerializer, DetailTableSerializer, MenuSerializers, TableSerializer
from core_posts.pagination import CustomPagination



class HotelDetails(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # First, check if the hotel data is cached
        cache_key = 'all_hotel'
        response = cache.get(cache_key)

        if response is None:
            hotels = BedRoom.objects.all()[:20]
            cities = Cities.objects.all()
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
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

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


class BedRoomFilter(filters.FilterSet):
    availability_from = filters.DateFilter(field_name="availability_from", lookup_expr="gte")
    availability_till = filters.DateFilter(field_name="availability_till", lookup_expr="lte")
    capacity = filters.NumberFilter(field_name="capacity", lookup_expr="gte")
    hotel_city_name = filters.CharFilter(field_name="hotel__city__name", lookup_expr="icontains")

    class Meta:
        model = BedRoom
        fields = ['availability_from', 'availability_till', 'capacity', 'hotel_city_name']


class BedRoomListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = BedRoom.objects.select_related('hotel', 'hotel__city').all()
    serializer_class = AllBedSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = BedRoomFilter
    pagination_class = CustomPagination  # Define or use DRF's default pagination

    def get_queryset(self):
        print(self.request.query_params)
        city_name = self.request.query_params.get('hotel_city_name', None)
        availability_from_str = self.request.query_params.get('availability_from', None)
        availability_till_str = self.request.query_params.get('availability_till', None)
        capacity = self.request.query_params.get('capacity', None)
     
        if not availability_from_str or not availability_till_str:
            raise ValidationError({'availability_dates': 'Both availability dates are required.'})
        
        # Ensure the input is a string before parsing
        if isinstance(availability_from_str, str):
            availability_from = parse_date(availability_from_str)
        else:
            raise ValidationError({'availability_from': 'Invalid date format.'})
        
        if isinstance(availability_till_str, str):
            availability_till = parse_date(availability_till_str)
        else:
            raise ValidationError({'availability_till': 'Invalid date format.'})
        
    
        if not city_name:
            raise ValidationError({'hotel_city_name': 'This field is required.'})
    
        availability_from = parse_date(availability_from_str)
        availability_till = parse_date(availability_till_str)
    
        if not availability_from or not availability_till:
            raise ValidationError({'availability_dates': 'Both availability dates are required.'})
    
        # Apply filtering based on availability
        queryset = super().get_queryset()
        queryset = queryset.filter(availability_from__lte=availability_till, availability_till__gte=availability_from, capacity=capacity)
        
        return queryset.order_by('availability_from')


class Tablesilter(filters.FilterSet):
    availability_from = filters.DateFilter(field_name="availability_from", lookup_expr="gte")
    capacity = filters.NumberFilter(field_name="capacity", lookup_expr="gte")
    hotel_city_name = filters.CharFilter(field_name="hotel__city__name", lookup_expr="icontains")

    class Meta:
        model = BedRoom
        fields = ['availability_from', 'availability_till', 'capacity', 'hotel_city_name']


class TablesListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = BedRoom.objects.select_related('hotel', 'hotel__city').all()
    serializer_class = AllBedSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = BedRoomFilter
    pagination_class = CustomPagination  # Define or use DRF's default pagination

    def get_queryset(self):
       
        city_name = self.request.query_params.get('hotel_city_name', None)
        availability_from_str = self.request.query_params.get('availability_from', None)
        availability_till_str = self.request.query_params.get('availability_till', None)
        capacity = self.request.query_params.get('capacity', None)
     
        if not availability_from_str or not availability_till_str:
            raise ValidationError({'availability_dates': 'Both availability dates are required.'})
        
        # Ensure the input is a string before parsing
        if isinstance(availability_from_str, str):
            availability_from = parse_date(availability_from_str)
        else:
            raise ValidationError({'availability_from': 'Invalid date format.'})
        
        if isinstance(availability_till_str, str):
            availability_till = parse_date(availability_till_str)
        else:
            raise ValidationError({'availability_till': 'Invalid date format.'})
        
    
        if not city_name:
            raise ValidationError({'hotel_city_name': 'This field is required.'})
    
        availability_from = parse_date(availability_from_str)
        availability_till = parse_date(availability_till_str)
    
        if not availability_from or not availability_till:
            raise ValidationError({'availability_dates': 'Both availability dates are required.'})
    
        # Apply filtering based on availability
        queryset = super().get_queryset()
        queryset = queryset.filter(availability_from__lte=availability_till, availability_till__gte=availability_from, capacity=capacity)
        
        return queryset.order_by('availability_from')

