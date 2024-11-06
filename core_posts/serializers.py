from rest_framework import serializers
from core_posts.models import Amenities, BedRoom,FavouriteList, Cities, Hotel, MenuItem, Tables, HotelImages, Review, ReviewType, Restaurant, ResturantImages
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSearializer(serializers.ModelSerializer):
    class Meta:
        model= User
        fields = ['profile_url','first_name', "last_name"]


class CitySerializer(serializers.ModelSerializer):
    """
    Serializer for Cities model.
    Handles city fields fields.
    """
    class Meta:
        model = Cities
        fields = ['city_id', 'name', 'image']  # 'image' instead of 'images'
        read_only_fields = ['city_id']  # ID is generated automatically

class SpecificCitySerializer(serializers.ModelSerializer):
    """
    Serializer for Cities model.
    Handles city fields fields.
    """
    class Meta:
        model = Cities
        fields = ['city_id', 'name']  # 'image' instead of 'images'
        read_only_fields = ['city_id']  # ID is generated automatically


# Hotel Data supplier

class AmenitiesSerializers(serializers.ModelSerializer):
    """
    Serializer for HotelImages model.
    Handles hotel image-related fields.
    """
    class Meta:
        model = Amenities
        fields = ['name']  # 'image' instead of 'images'
        read_only_fields = ['name']  # ID is generated automatically

class HotelImagesSerializer(serializers.ModelSerializer):
    """
    Serializer for HotelImages model.
    Handles hotel image-related fields.
    """
    class Meta:
        model = HotelImages
        fields = ['hotel_image_id', 'image']  # 'image' instead of 'images'
        read_only_fields = ['hotel_image_id']  # ID is generated automatically


class AllHotelSerializer(serializers.ModelSerializer):
    city = SpecificCitySerializer(read_only=True)
    class Meta:
        model = Hotel
        fields = ['hotel_id', 'name', 'city', 'country']
        read_only_fields = ['hotel_id', 'name']  # Prevent updates on auto-generated ID and unique email

class MiniHotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ['name']
        
class HotelRelationSerializer(serializers.ModelSerializer):
    images = HotelImagesSerializer(many=True, read_only=True)
    city = CitySerializer(read_only=True)
    
    class Meta:
        model = Hotel
        fields = ['hotel_id', 'images', 'country', 'address', 'city']  # 'images' references the related set of HotelImages
        read_only_fields = ['hotel_id']

class AllBedSerializer(serializers.ModelSerializer):
    """
    Serializer for BedRoom model.

    Optimized for performance by minimizing fields and using read-only where possible.
    """
    hotel = AllHotelSerializer(read_only=True)
    image = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()  # Change to SerializerMethodField

    class Meta:
        model = BedRoom
        fields = ['room_id', 'image', 'hotel', 'room_type', 'description', 'price', 'capacity', 'avg_rating', 'availability_from', 'availability_till']
        read_only_fields = ['room_id']
        write_only_fields = ['availability_from', 'availability_till']

    def get_avg_rating(self, obj):
        """Retrieve the average rating for the room."""
        return obj.average_rating()  # Call the method on the BedRoom model

    def get_image(self, obj):
        """Return the relative path to the image instead of the absolute URL."""
        if obj.image:
            return obj.image.url  # This will return the relative path (e.g., 'beds/images/hotel-1.jpg')
        return None
    

class MiniBedSerializer(serializers.ModelSerializer):
    """
    Serializer for BedRoom model.

    Optimized for performance by minimizing fields and using read-only where possible.
    """
    hotel = MiniHotelSerializer(read_only=True)
    class Meta:
        model = BedRoom
        fields = ['room_id', 'image', 'hotel',]

    def get_image(self, obj):
        """Return the relative path to the image instead of the absolute URL."""
        if obj.image:
            return obj.image.url  # This will return the relative path (e.g., 'beds/images/hotel-1.jpg')
        return None
    

class DetailsBedSerializer(serializers.ModelSerializer):
    """
    Serializer for BedRoom model.

    Optimized for performance by minimizing fields and using read-only where possible.
    """
    hotel = MiniHotelSerializer(read_only=True)
    avg_rating = serializers.SerializerMethodField(read_only=True) 
    class Meta:
        model = BedRoom
        fields = ['room_id', 'image', 'hotel','price','avg_rating', 'room_type']

    def get_image(self, obj):
        """Return the relative path to the image instead of the absolute URL."""
        if obj.image:
            return obj.image.url  # This will return the relative path (e.g., 'beds/images/hotel-1.jpg')
        return None
    
    def get_avg_rating(self, obj):
        """Retrieve the average rating for the room."""
        return obj.average_rating() 




# Resturant Data supplier

class ResturantImagesSerializer(serializers.ModelSerializer):
    """
    Serializer for HotelImages model.
    Handles Review image-related fields.
    """
    class Meta:
        model = ResturantImages
        fields = ['restaurant_image_id', 'image']  
        read_only_fields = ['restaurant_image_id']  


class AllResturantSerializer(serializers.ModelSerializer):
    city = SpecificCitySerializer(read_only=True)

    class Meta:
        model = Restaurant
        fields = ['restaurant_id', 'city', 'country', 'address', 'name']  # Fixed typo and added fields
        read_only_fields = ['resturant_id']


class MiniResturantSerializer(serializers.ModelSerializer):

    class Meta:
        model = Restaurant
        fields = [ 'name'] 




class RelationResturantSerializer(serializers.ModelSerializer):
    city = SpecificCitySerializer(read_only=True)
    images = ResturantImagesSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = ['restaurant_id', 'city', 'country', 'address', 'name', 'images']  # Fixed typo and added fields
        read_only_fields = ['resturant_id']

class MenuSerializers(serializers.ModelSerializer):

    class Meta:
        model = MenuItem
        fields = ['dish_id','image',  'name', 'description', 'price', 'category']  # Fixed typo and added fields
        read_only_fields = ['dish_id']



# Review Data supplier
class ReviewTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ReviewType
        fields = ['name', 'rate']


class ReviewHotelSerializer(serializers.ModelSerializer):
    rating = ReviewTypeSerializer(many=True, read_only=True)  # Add many=True here
    user = UserSearializer(read_only = True)
    class Meta:
        model = Review
        fields = ['review_id','user', 'room', 'rating', 'comment', 'date_of_notice']
        read_only_fields = ['review_id']

class ReviewResturantSerializer(serializers.ModelSerializer):
    rating = ReviewTypeSerializer(many=True, read_only=True)  # Add many=True here
    user = UserSearializer(read_only = True)
    class Meta:
        model = Review
        fields = ['review_id','user', 'tables_of_resturant', 'rating', 'comment', 'date_of_notice']
        read_only_fields = ['review_id']





# Specific data supplier
class DetailBedSerializer(serializers.ModelSerializer):
    """
    Serializer for BedRoom model.
    """
    hotel = HotelRelationSerializer(read_only=True)  
    reviews = ReviewHotelSerializer(many=True,read_only=True) 
    room_amenities = AmenitiesSerializers(many=True,read_only=True)  
    avg_rating = serializers.SerializerMethodField() 

    class Meta:
        model = BedRoom
        fields = ['room_id', 'room_type', 'description', 'price', 'capacity', 'room_amenities', 'avg_rating','hotel', 'reviews']
        read_only_fields = ['room_id']
    
    def get_avg_rating(self, obj):
        """Retrieve the average rating for the room."""
        return obj.average_rating()  # Call the method on the BedRoom model



class DetailTableSerializer(serializers.ModelSerializer):
    """
    Serializer for BedRoom model.
    """
    restaurant = RelationResturantSerializer(read_only=True)  # No 'many=True' since it's a ForeignKey relation
    review = ReviewResturantSerializer(many=True,read_only=True)  # No 'many=True' since it's a ForeignKey relation
   
    class Meta:
        model = Tables
        fields = ['table_id', 'restaurant', 'review','price', 'capacity', 'availability_from']
        read_only_fields = ['table_id']


class MiniTableSerializer(serializers.ModelSerializer):
    """
    Serializer for Table model.
    """
    restaurant = MiniResturantSerializer(read_only=True)  # No 'many=True' since it's a ForeignKey relation

    class Meta:
        model = Tables
        fields = ['table_id', 'restaurant', 'images', 'price']


class DetailCartTableSerializer(serializers.ModelSerializer):
    """
    Serializer for Table model.
    """
    restaurant = MiniResturantSerializer(read_only=True)  # No 'many=True' since it's a ForeignKey relation
    avg_rating = serializers.SerializerMethodField() 
    class Meta:
        model = Tables
        fields = ['table_id', 'restaurant', 'images', 'price','avg_rating']
    
    def get_avg_rating(self, obj):
        """Retrieve the average rating for the room."""
        return obj.average_rating()  # Call the method on the BedRoom model



class TableSerializer(serializers.ModelSerializer):
    """
    Serializer for HotelImages model.
    Handles Review image-related fields.
    """
    restaurant = AllResturantSerializer(read_only=True)
    review = ReviewResturantSerializer(many=True, read_only=True)
    avg_rating = serializers.SerializerMethodField() 

    class Meta:
        model = Tables
        fields = ['table_id', 'images', 'restaurant', 'review', 'capacity', 'price', 'avg_rating']  
        read_only_fields = ['table_id']  
    
    def get_avg_rating(self, obj):
        """Retrieve the average rating for the room."""
        return obj.average_rating()  # Call the method on the BedRoom model



# Search with reviews
class SearchBedSerializer(serializers.ModelSerializer):
    hotel = AllHotelSerializer(read_only=True)
    room_amenities = AmenitiesSerializers(read_only=True, many=True)
    image = serializers.SerializerMethodField()
    reviews = ReviewHotelSerializer(read_only=True, many=True)

    class Meta:
        model = BedRoom
        fields = [
            'room_id', 'image', 'hotel', 'room_type', 'description', 
            'price', 'capacity', 'room_amenities', 'reviews', 
            'availability_from', 'availability_till', 
        ]
        read_only_fields = ['room_id']
        write_only_fields = ['availability_from', 'availability_till']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url  # Return relative path of image
        return None
    
class SearchTableSerializer(serializers.ModelSerializer):
    restaurant = AllResturantSerializer(read_only=True)
    review = ReviewResturantSerializer(many=True, read_only=True)

    class Meta:
        model = Tables
        fields = ['table_id', 'images', 'restaurant', 'review', 'capacity']  
        read_only_fields = ['table_id']  
        
    def get_image(self, obj):
        if obj.image:
            return obj.image.url  # Return relative path of image
        return None

class FavCreate(serializers.ModelSerializer):
    user = UserSearializer(read_only=True)
    fav_bed = AllBedSerializer(many=True, read_only=True)
    fav_table = TableSerializer(many=True, read_only=True)
    
    class Meta:
        model = FavouriteList
        fields = ['favourite_list_id', 'user', 'name', 'fav_table', 'fav_bed', 'created_at']

