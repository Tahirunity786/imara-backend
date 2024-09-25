from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import Response
from django.db import transaction
from django.core.cache import cache
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from core_posts.models import BedRoom, Hotel
from core_posts.serializers import DetailBedSerializer, AllBedSerializer

class HotelDetails(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # First, check if the hotel data is cached
        cache_key = 'all_hotel'
        hotel_data = cache.get(cache_key)

        if hotel_data is None:
            hotels = BedRoom.objects.all()[:20]
            serializer = AllBedSerializer(hotels, many=True)  # Added many=True

            # Cache the result for future requests (e.g., cache for 10 minutes)
            hotel_data = serializer.data
            cache.set(cache_key, hotel_data, timeout=120)

        # Return the cached or freshly serialized data
        return Response(hotel_data, status=status.HTTP_200_OK)




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
