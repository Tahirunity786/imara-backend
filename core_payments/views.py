import base64
import json
import stripe
from rest_framework.views import APIView, Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings
from core_payments.serializer import DataSerialize
from core_posts.models import BedRoom, Tables
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import stripe
import base64
import json
import logging

logger = logging.getLogger(__name__)


stripe.api_key = settings.STRIPE_API_KEY


class CreatePaymentIntent(APIView):
    permission_classes = [AllowAny]

    def item_based_cal(self, key, type_ex):
        """
        Fetches the item from the appropriate model based on the type.
        Returns the item's price if found, otherwise raises a ValueError.
        """
        try:
            if type_ex == "bed":
                data = BedRoom.objects.get(room_id=key)
                return data.price  # Assuming BedRoom has a `price` field
            elif type_ex == "table":
                data = Tables.objects.get(table_id=key)
                return data.price  # Assuming Tables has a `price` field
            else:
                raise ValueError("Invalid item type provided.")
        except BedRoom.DoesNotExist:
            raise ValueError("Invalid BedRoom key provided.")
        except Tables.DoesNotExist:
            raise ValueError("Invalid Table key provided.")

    def price_calculations(self, items):
        """
        Calculates the total price for multiple items.
        Raises ValueError for invalid or missing item data.
        """
        if not isinstance(items, list):
            raise ValueError("Expected a list of items for price calculation.")

        total_price = 0
        for item in items:
            try:
                key = item.get('key')
                item_type = item.get('type')
                nights = int(item.get('nights', 0))

                if not key or not item_type:
                    raise ValueError("Missing required fields in item.")

                price_per_unit = self.item_based_cal(key, item_type)

                # Calculate total price based on item type
                if item_type == "bed":
                    total_price += price_per_unit * nights
                elif item_type == "table":
                    total_price += price_per_unit
                else:
                    raise ValueError(f"Unsupported item type: {item_type}")

            except (ValueError, TypeError) as e:
                logger.error(f"Error in price calculation for item {item}: {e}")
                raise ValueError(f"Invalid item structure or missing fields: {item}")

        return total_price

    def per_price_calculations(self, item):
        """
        Handles price calculation for a single item.
        Returns the calculated price.
        """
        try:
            key = item.get('key')
            item_type = item.get('type')
            nights = int(item.get('nights', 0))

            if not key or not item_type:
                raise ValueError("Missing required fields in single item.")

            price_per_unit = self.item_based_cal(key, item_type)

            # Calculate price based on item type
            if item_type == "bed":
                return price_per_unit * nights
            elif item_type == "table":
                return price_per_unit
            else:
                raise ValueError(f"Unsupported item type: {item_type}")

        except (ValueError, TypeError) as e:
            logger.error(f"Error in single item price calculation: {e}")
            raise ValueError("Invalid item structure or missing fields.")

    def decode_data_token(self, data_token):
        """
        Decodes the base64-encoded token and returns the parsed JSON data.
        """
        try:
            decoded_bytes = base64.b64decode(data_token)
            decoded_str = decoded_bytes.decode('utf-8')
            return json.loads(decoded_str)
        except (base64.binascii.Error, UnicodeDecodeError, json.JSONDecodeError) as e:
            logger.error(f"Failed to decode or parse data token: {e}")
            raise ValueError("Invalid data token.")

    def post(self, request):
        """
        Handles the POST request to create a Stripe payment intent.
        """
        serializer = DataSerialize(data=request.data)

        if not serializer.is_valid():
            return Response({
                "error": "Invalid data",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # Extract and decode the token
        data_token = serializer.validated_data.get('data_token')

        try:
            items = self.decode_data_token(data_token)

            # Determine whether the input is single-item or multi-item
            if isinstance(items, dict):
                # Single item
                grand_price = self.per_price_calculations(items)
            elif isinstance(items, list):
                # Multiple items
                grand_price = self.price_calculations(items)
            else:
                raise ValueError("Invalid items format. Expected a dictionary or a list.")

        except ValueError as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create Stripe payment intent
        try:
            customer = stripe.Customer.create(
                name="Example Customer",  # Replace with actual customer name from request
                email="example@test.com"  # Replace with actual email from request
            )
            amount = int(grand_price * 100)  # Stripe requires amount in cents
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
                currency="usd",
                customer=customer['id'],
                automatic_payment_methods={"enabled": True},
            )
            return Response({'client_secret': payment_intent.client_secret}, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return Response({
                "error": "Failed to create payment intent",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return Response({
                "error": "Internal server error"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)