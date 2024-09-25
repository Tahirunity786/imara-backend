from rest_framework import serializers
from core_posts.models import BedRoom, Cities, Hotel, HotelImages, Review, ReviewType

class HotelImagesSerializer(serializers.ModelSerializer):
    """
    Serializer for HotelImages model.
    Handles hotel image-related fields.
    """
    class Meta:
        model = HotelImages
        fields = ['hotel_image_id', 'image']  # 'image' instead of 'images'
        read_only_fields = ['hotel_image_id']  # ID is generated automatically

class CitySerializer(serializers.ModelSerializer):
    """
    Serializer for Cities model.
    Handles city fields fields.
    """
    class Meta:
        model = Cities
        fields = ['city_id', 'name']  # 'image' instead of 'images'
        read_only_fields = ['city_id']  # ID is generated automatically

class HotelRelationSerializer(serializers.ModelSerializer):
    images = HotelImagesSerializer(many=True, read_only=True)
    city = CitySerializer(read_only=True)
    
    class Meta:
        model = Hotel
        fields = ['hotel_id', 'images', 'country', 'address', 'city']  # 'images' references the related set of HotelImages
        read_only_fields = ['hotel_id']
        
class AllHotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ['hotel_id', 'name', 'city', 'country']
        read_only_fields = ['hotel_id', 'name']  # Prevent updates on auto-generated ID and unique email

class ReviewTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ReviewType
        fields = ['name', 'rate']


class ReviewHotelSerializer(serializers.ModelSerializer):
    rating = ReviewTypeSerializer(many=True, read_only=True)  # Add many=True here

    class Meta:
        model = Review
        fields = ['review_id','user', 'room', 'rating', 'comment', 'date_of_notice']
        read_only_fields = ['review_id']



class DetailBedSerializer(serializers.ModelSerializer):
    """
    Serializer for BedRoom model.
    """
    hotel = HotelRelationSerializer(read_only=True)  # No 'many=True' since it's a ForeignKey relation
    reviews = ReviewHotelSerializer(many=True,read_only=True)  # No 'many=True' since it's a ForeignKey relation

    class Meta:
        model = BedRoom
        fields = ['room_id', 'room_type', 'description', 'price', 'capacity', 'room_amenities', 'hotel', 'reviews']
        read_only_fields = ['room_id']

class AllBedSerializer(serializers.ModelSerializer):
    """
    Serializer for Bed model.
    
    Optimized for performance by minimizing fields and using read-only where possible.
    """
    hotel = AllHotelSerializer(read_only=True)
    class Meta:
        model = BedRoom
        fields = ['room_id', 'image','hotel', 'room_type','description','price', 'capacity', 'room_amenities']
        read_only_fields = ['room_id']

    