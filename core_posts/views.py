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
from core_posts.models import Amenities, BedRoom, Cities, FavouriteList, Hotel, Restaurant, Tables, MenuItem
from core_posts.serializers import DetailBedSerializer, DetailCartTableSerializer, DetailsBedSerializer, FavCreate, MiniBedSerializer, MiniTableSerializer,SearchBedSerializer, AllBedSerializer, CitySerializer, DetailTableSerializer, MenuSerializers, SearchTableSerializer, SpecificCitySerializer, TableSerializer
from core_posts.pagination import CustomPagination
from django.db import models
from django_filters import rest_framework as django_filters
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils.encoding import DjangoUnicodeDecodeError
from django.db.models import Prefetch
from django.db.models import Q, F, ExpressionWrapper, IntegerField
from core_posts.utiles import IsOwner
import base64
import json

class HotelDetails(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # First, check if the hotel data is cached
        cache_key = 'all_hotel'
        response = cache.get(cache_key)

        if response is None:
            hotels = BedRoom.objects.all()[:16]
            cities = Cities.objects.all().order_by('-id')[:5]
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
            cache.set(cache_key, response, timeout=200)

        # Return the cached or freshly serialized data
        return Response(response, status=status.HTTP_200_OK)
    

class ResturantDetails(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # First, check if the hotel data is cached
        cache_key = 'all_resturant'
        response = cache.get(cache_key)

        if response is None:
            tables = Tables.objects.all()[:16]
            cities = Cities.objects.all().order_by('-id')[:5]
            
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
    Allows access without requiring authentication.
    """
    permission_classes = [AllowAny]

    def get(self, request, post_id):
        # Step 1: Attempt to decode the post_id if it's encoded
        try:
            decoded_post_id = urlsafe_base64_decode(post_id).decode('utf-8')
            post_id = decoded_post_id  # If decoding is successful, use decoded value
        except (DjangoUnicodeDecodeError, ValueError):
            # If decoding fails, post_id is likely in raw form, so we leave it as is
            pass

        # Step 2: Cache key for the specific hotel data
        cache_key = f'hotel_{post_id}'
        hotel_data = cache.get(cache_key)

        # Step 3: Check if cached data exists, otherwise fetch from the database
        if hotel_data is None:
            # Fetch the specific bed by its room_id (decoded or raw)
            bed = get_object_or_404(BedRoom, room_id=post_id)
            hotel = bed.hotel  # Get the hotel object linked to the bed

            # Fetch all bed objects related to the same hotel, excluding the specific bed
            all_beds = BedRoom.objects.filter(hotel=hotel).exclude(id=bed.id)

            # Serialize the specific bed and all related beds
            specific_bed_serializer = DetailBedSerializer(bed)
            all_beds_serializer = AllBedSerializer(all_beds, many=True)

            # Prepare the response data
            hotel_data = {
                'specific_bed': specific_bed_serializer.data,
                'all_beds': all_beds_serializer.data
            }

            # Cache the result to optimize repeated queries (set for 10 minutes)
            cache.set(cache_key, hotel_data, timeout=200)

        # Step 4: Return cached or freshly serialized data
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
            cache.set(cache_key, table_data, timeout=200)

        # Return cached or freshly serialized data
        return Response(table_data, status=200)

class BedRoomFilter(filters.FilterSet):
    capacity = filters.NumberFilter(field_name="capacity", lookup_expr="gte")
    city_name = filters.CharFilter(field_name="hotel__city__name", lookup_expr="icontains")
    room_amenities = filters.ModelMultipleChoiceFilter(
        field_name="room_amenities",
        queryset=Amenities.objects.all(),
        conjoined=False
    )

    class Meta:
        model = BedRoom
        fields = ['capacity', 'room_amenities', 'city_name']


class BedRoomListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = BedRoom.objects.select_related('hotel', 'hotel__city').all()
    serializer_class = SearchBedSerializer
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = BedRoomFilter
    pagination_class = CustomPagination  # Optional: Use DRF's pagination

    def get_queryset(self):
        # Extract query parameters
        city_name = self.request.query_params.get('city_name')
        availability_from_str = self.request.query_params.get('availability_from')
        availability_till_str = self.request.query_params.get('availability_till')
        capacity = self.request.query_params.get('capacity')
        room_amenities = self.request.query_params.get('room_amenities', '')
        price = self.request.query_params.get('price')
        rating_str = self.request.query_params.get('room_rating')

        # Validate required fields
        if not city_name:
            raise ValidationError({'city_name': 'This field is required.'})
        if not availability_from_str or not availability_till_str:
            raise ValidationError({'availability_dates': 'Both availability dates are required.'})

        # Parse dates and validate availability range
        try:
            availability_from = parse_date(availability_from_str)
            availability_till = parse_date(availability_till_str)
            if availability_till < availability_from:
                raise ValidationError("Availability 'till' must be greater than or equal to 'from'.")
            available_days = (availability_till - availability_from).days
        except (ValueError, TypeError):
            raise ValidationError({'availability_dates': 'Invalid date format.'})

        # Base queryset
        queryset = super().get_queryset()

        # Filter by availability
        if available_days != 0:
            queryset = queryset.filter(available_days__lte=available_days)

        # Filter by price if provided
        if price:
            try:
                price = int(price)
                queryset = queryset.filter(price__gte=1000, price__lte=price)
            except ValueError:
                raise ValidationError({'price': 'Invalid price value.'})

        # Filter by city name and capacity
        queryset = queryset.filter(
            hotel__city__name__icontains=city_name,
            capacity__gte=capacity if capacity else 1  # Ensure valid capacity is applied
        )

        # Filter by room amenities
        if room_amenities:
            try:
                amenities_list = [int(amenity) for amenity in room_amenities.split(',')]
                queryset = queryset.filter(room_amenities__id__in=amenities_list)
            except ValueError:
                raise ValidationError({'room_amenities': 'Invalid room amenities format.'})

        # Filter by room rating if provided
        if rating_str:
            try:
                rating = float(rating_str)
            except ValueError:
                raise ValidationError({'room_rating': 'Invalid rating value.'})

            matching_rooms = [room.id for room in queryset if int(room.average_rating()) == rating]
            queryset = queryset.filter(id__in=matching_rooms)

        return queryset.order_by('availability_from')

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        # Add query parameters to the response
        response.data['query_params'] = {
            'city_name': request.query_params.get('city_name', None),
            'availability_from': request.query_params.get('availability_from', None),
            'availability_till': request.query_params.get('availability_till', None),
            'capacity': request.query_params.get('capacity', None),
            'price': request.query_params.get('price', None),
            'room_rating': request.query_params.get('room_rating', None),
            'room_amenities': request.query_params.get('room_amenities', None),
        }

        return response

# Custom filter for the Tables model
class TablesFilter(filters.FilterSet):
    
    capacity = filters.NumberFilter(field_name="capacity", lookup_expr="gte")
    hotel_city_name = filters.CharFilter(field_name="restaurant__city__name", lookup_expr="icontains")

    class Meta:
        model = Tables
        fields = ['capacity', 'hotel_city_name']

class TablesListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Tables.objects.select_related('restaurant', 'restaurant__city').all()
    serializer_class = SearchTableSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = TablesFilter
    pagination_class = CustomPagination

    def get_queryset(self):
        """
        Customize the queryset filtering logic based on additional parameters.
        """
        queryset = self.queryset.order_by('availability_from')  # Ensure ordered queryset

        # Extract query parameters
        city_name = self.request.query_params.get('city_name')
        availability_from_str = self.request.query_params.get('availability_from')
        table_rating = self.request.query_params.get('table_rating')
        capacity = self.request.query_params.get('capacity')
        persons = self.request.query_params.get('persons')
        price = self.request.query_params.get('price')

        # Filter by city name
        if city_name:
            queryset = queryset.filter(restaurant__city__name__icontains=city_name)
        
        
        # Filter by availability from date
        if availability_from_str:
            try:
                availability_from = parse_date(availability_from_str)
                if not availability_from:
                    raise ValidationError({'availability_from': 'Invalid date format.'})
                queryset = queryset.filter(availability_from__gte=availability_from)
            except ValueError:
                raise ValidationError({'availability_from': 'Invalid date value.'})

        # Filter by capacity (minimum table size)
        if capacity:
            try:
                capacity = int(capacity)
                queryset = queryset.filter(capacity__gte=capacity)
            except ValueError:
                raise ValidationError({'capacity': 'Invalid capacity value.'})

        # Filter by number of persons (another capacity filter)
        if persons:
            try:
                persons = int(persons)
                queryset = queryset.filter(capacity__gte=persons)
            except ValueError:
                raise ValidationError({'persons': 'Invalid persons value.'})

        # Filter by price (max price)
        if price:
            try:
                price = float(price)
                queryset = queryset.filter(price__lte=price)
            except ValueError:
                raise ValidationError({'price': 'Invalid price value.'})
            
        # Filter by room rating if provided
        if table_rating:
            try:
                rating = float(table_rating)
            except ValueError:
                raise ValidationError({'room_rating': 'Invalid rating value.'})

            matching_rooms = [table.id for table in queryset if int(table.average_rating()) == rating]
            queryset = queryset.filter(id__in=matching_rooms)


        return queryset

    def list(self, request, *args, **kwargs):
        """
        Override list method to add custom response formatting if needed.
        """
        response = super().list(request, *args, **kwargs)
        # Optionally customize the response format or add extra data to the response
        return response

class ShareableLinkView(APIView):
    """
    Class-based view to generate a secure shareable link for a room.
    """
    permission_classes = [AllowAny]  # Only authenticated users can access the API

    def get(self, request, room_id):
        # Fetch the room securely
        room = get_object_or_404(BedRoom, room_id=room_id)

        # Securely encode the room ID to generate the link
        encoded_id = urlsafe_base64_encode(force_bytes(room.room_id))

        # Construct the shareable URL
        shareable_link = f"{settings.FRONTEND_URL}/nakiese/hotel/bed-detail/{encoded_id}"

        # Respond with the shareable link
        return Response({
            "shareable_link": shareable_link
        }, status=200)
    

class FavouriteListCreateView(generics.CreateAPIView):
    serializer_class = FavCreate
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically associate the favourite list with the currently authenticated user
        serializer.save(user=self.request.user)

# View to list and retrieve Favourite Lists with pagination and optimized queries
class FavouriteListDetailView(generics.ListAPIView):
    serializer_class = FavCreate
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        # Optimize related object fetching with prefetch_related for many-to-many relationships
        return FavouriteList.objects.filter(user=self.request.user).prefetch_related(
            Prefetch('fav_bed', queryset=BedRoom.objects.all()), 
            Prefetch('fav_table', queryset=Tables.objects.all())
        )

# View to retrieve a specific favourite list by ID
class FavouriteListRetrieveView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request, fav_id):
        fav_list = get_object_or_404(FavouriteList, favourite_list_id=fav_id, user=request.user)
        serializer = FavCreate(fav_list)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class CityExploreView(APIView):
    permission_classes = [AllowAny]
    pagination_class = CustomPagination

    def get(self, request):
        city_id = request.query_params.get('city_id')

        if not city_id:
            return Response({'error': "City not found or deleted"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the city using the city_id with only required fields
        city = get_object_or_404(Cities.objects.only('city_id', 'name'), city_id=city_id)

        # Fetch hotels and related bedrooms in a single query using prefetch_related
        hotels = Hotel.objects.filter(city=city).only('hotel_id', 'name')

        # Efficient fetching of bedrooms related to the hotels
        # Removing 'hotel' from .only() since we need it for select_related()
        bedrooms = BedRoom.objects.filter(hotel__in=hotels)

        # Prefetch related tables in restaurants using prefetch_related
        tables = Tables.objects.filter(restaurant__city=city)

        # Apply pagination to bedrooms and tables (for large data sets)
        paginator = CustomPagination()
        paginated_beds = paginator.paginate_queryset(bedrooms, request)
        paginated_tables = paginator.paginate_queryset(tables, request)

        # Serialize paginated data
        tables_serializer = TableSerializer(paginated_tables, many=True)
        bedrooms_serializer = AllBedSerializer(paginated_beds, many=True)
        city_serializer = CitySerializer(city)

        data = {
            'tables': tables_serializer.data,
            'beds': bedrooms_serializer.data,
            'city': city_serializer.data
        }

        return paginator.get_paginated_response(data)


class CityListView(generics.ListAPIView):
    serializer_class = SpecificCitySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Return all city objects
        return Cities.objects.all()

class PriceProviderView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        room_id = request.query_params.get('ex_room_id')

        try:
            room = BedRoom.objects.get(room_id=room_id)
        except BedRoom.DoesNotExist:
            return Response({'error':'Room not available or deleted'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = {
            'price':room.price
        }

        return Response(data, status=status.HTTP_200_OK)
    
class TablePriceProviderView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        table_id = request.query_params.get('ex_table_id')

        try:
            room = Tables.objects.get(table_id=table_id)
        except Tables.DoesNotExist:
            return Response({'error':'Room not available or deleted'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = {
            'price':room.price
        }

        return Response(data, status=status.HTTP_200_OK)
    
class CartRoomAgentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uni_ids = request.data.get('ids', [])
        nights = request.data.get('nights', [])


        if not uni_ids:
            return Response({'error': 'Room IDs must be provided.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(uni_ids) != len(nights):
            return Response(
                {'error': 'Number of nights must match the number of provided room IDs.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch room instances from the database
        rooms = BedRoom.objects.filter(room_id__in=uni_ids)

        if not rooms.exists():
            return Response({'error': 'No rooms found for the provided IDs.'}, status=status.HTTP_404_NOT_FOUND)

        # Calculate total prices and serialize data
        room_data = []
        for room, night in zip(rooms, nights):
            total_price = room.price * night  # Calculate total price
            room_data.append({
                'room_id': room.room_id,
                'image': room.image.url if room.image else None,
                # 'price_per_night': room.price,
                'nights': night,
                'hotel': room.hotel.name,
                'total_price': total_price,
            })

        return Response(room_data, status=status.HTTP_200_OK)



class CartTableAgentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uni_ids = request.data.get('ids', [])
        dates = request.data.get('dates', [])

        if not uni_ids:
            return Response({'error': 'Table IDs must be provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch table instances from the database
        instances = Tables.objects.filter(table_id__in=uni_ids)

        if not instances.exists():
            return Response({'error': 'No tables found for the provided IDs.'}, status=status.HTTP_404_NOT_FOUND)

        # Serialize table data
        serialized_data = MiniTableSerializer(instances, many=True).data
        
        # Add corresponding date to each table item
        for i, item in enumerate(serialized_data):
            item['date'] = dates[i] if i < len(dates) else 'N/A'


        return Response(serialized_data, status=status.HTTP_200_OK)



class CarSerializeView(APIView):
    permission_classes = [AllowAny]
    def data_extract(self, items):
        """
        Extracts room and table details from the provided items, calculates total prices
        for each type, and returns structured data including item details and total prices.
        
        Parameters:
            items (list): List of dictionaries containing item details, where each item
                          includes type, id, and additional attributes.
        
        Returns:
            dict: Contains details and prices for rooms and tables, as well as their total prices.
        
        Raises:
            ValueError: If the item structure is invalid, missing fields, or contains invalid types.
        """
        room_details = []
        table_details = []
        total_price_room = 0
        total_price_table = 0
    
        try:
            for item in items:
                item_type = item.get('type')
                if item_type == "bed":
                    room = BedRoom.objects.filter(room_id=item.get('room_id', '')).first()
                    if room:
                        nights = item.get('nights', 0)
                        room_total_price = room.price * nights
                        total_price_room += room_total_price
                        room_details.append({
                            'total_price': room_total_price
                        })
                    else:
                        raise ValueError(f"Room with id {item.get('room_id', '')} not found.")
                
                elif item_type == "table":
                    table = Tables.objects.filter(table_id=item.get('table_id', '')).first()
                    if table:
                        total_price_table += table.price
                        table_details.append({
                       
                            'capacity': table.capacity,  # Assuming `capacity` is an attribute of Tables
                            'price': table.price
                        })
                    else:
                        raise ValueError(f"Table with id {item.get('table_id', '')} not found.")
                else:
                    raise ValueError("Invalid item type in payload.")
        
        except (TypeError, ValueError) as e:
            raise ValueError("Invalid item structure or missing fields.") from e
        
        # Total price across all items
        total_price = total_price_room + total_price_table
        
        return {
            'rooms': {
                'details': room_details,
                'total_price': total_price_room
            },
            'tables': {
                'details': table_details,
                'total_price': total_price_table
            },
            'grand_total_price': total_price
        }
    def get_room(self, id):
        room = BedRoom.objects.filter(room_id=id).first()
        if room:
            nights = 1
            room_total_price = room.price * nights
            total_price= room_total_price
        else:
            raise ValueError(f"Room with id {id} not found.")
        
        return {"total_price":total_price, 'type':'bed'}
    

    def get_table(self, id):
        table = Tables.objects.filter(table_id=id).first()
        if table:
            table_details={
                'type':'table',
                'price': table.price
            }
        else:
            raise ValueError(f"Table with id {id} not found.")
        return table_details

    def get(self, request):
        encoded_param = request.query_params.get('source')
        key = request.query_params.get('key')
        
        if encoded_param:
            try:
                # Decode the base64 encoded string
                decoded_bytes = base64.b64decode(encoded_param)
                decoded_str = decoded_bytes.decode('utf-8')
                
                # Parse JSON data
                param_for = json.loads(decoded_str)
                
                serialize_data = self.data_extract(param_for)
                
                return Response(serialize_data, status=status.HTTP_200_OK)
            except (ValueError, json.JSONDecodeError) as e:
                # Handle decoding or JSON parsing errors
                print("Error decoding or parsing the source parameter:", e)
                return Response({"error": "Invalid parameter format"}, status=status.HTTP_400_BAD_REQUEST)
         # Handle `key` and `type` parameters
        elif key:
            type_of = request.query_params.get('type')
            if type_of == "bed":
                response_data = self.get_room(key)
            elif type_of == "table":
                response_data = self.get_table(key)
            else:
                return Response({"error": "Invalid 'type' parameter"}, status=status.HTTP_400_BAD_REQUEST)
            return Response(response_data, status=status.HTTP_200_OK)
        return Response({"error": "Missing 'source' parameter"}, status=status.HTTP_400_BAD_REQUEST)


class PaymentDetailCartSerializeView(APIView):
    permission_classes = [AllowAny]

    def data_extract(self, items):
        """
        Extracts data for rooms and tables from the given items and serializes them.
        Returns structured data with rooms and tables information.
        """
        rooms = []
        tables = []

        for item in items:
            item_type = item.get('type')
            item_id = item.get('room_id' if item_type == "bed" else 'table_id', '')

            if item_type == "bed":
                room = BedRoom.objects.filter(room_id=item_id).first()
                if room:
                    rooms.append(DetailsBedSerializer(room).data)
                else:
                    print(f"Room with ID {item_id} not found.")

            elif item_type == "table":
                table = Tables.objects.filter(table_id=item_id).first()
                if table:
                    table_data = DetailCartTableSerializer(table).data
                    table_data['date'] = item.get('date')  # Attach date if available
                    tables.append(table_data)
                else:
                    print(f"Table with ID {item_id} not found.")
            else:
                print("Invalid item type provided.")

        return {
            'rooms': rooms or "",
            'tables': tables or ""
        }

    def get_room(self, room_id):
        room = BedRoom.objects.filter(room_id=room_id).first()
        return DetailsBedSerializer(room).data if room else {"error": "Room not found"}

    def get_table(self, table_id):
        table = Tables.objects.filter(table_id=table_id).first()
        return DetailCartTableSerializer(table).data if table else {"error": "Table not found"}

    def get(self, request):
        source_param = request.query_params.get('source')
        key = request.query_params.get('key')
        type_of = request.query_params.get('type')

        # Handle `source` parameter
        if source_param:
            try:
                decoded_str = base64.b64decode(source_param).decode('utf-8')
                param_for = json.loads(decoded_str)
                serialized_data = self.data_extract(param_for)
                return Response(serialized_data, status=status.HTTP_200_OK)
            except (ValueError, json.JSONDecodeError) as e:
                print("Error decoding or parsing 'source' parameter:", e)
                return Response({"error": "Invalid 'source' parameter format"}, status=status.HTTP_400_BAD_REQUEST)

        # Handle `key` and `type` parameters
        if key and type_of:
            if type_of == "bed":
                response_data = self.get_room(key)
                response_data['type']=type_of
            elif type_of == "table":
                response_data = self.get_table(key)
                response_data['type']=type_of
            else:
                return Response({"error": "Invalid 'type' parameter"}, status=status.HTTP_400_BAD_REQUEST)
            return Response(response_data, status=status.HTTP_200_OK)

        return Response({"error": "Missing 'source' or 'key' parameters"}, status=status.HTTP_400_BAD_REQUEST)