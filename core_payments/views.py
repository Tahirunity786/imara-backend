import base64
import json
import stripe
from rest_framework.views import APIView, Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from core_payments.serializer import DataSerialize
stripe.api_key = 'sk_test_51QGyWdFJdJFkrSKs6AmNEfcXtdt5vYDYAklv64Owag2w1y1GyIWXSkXgi5s0WIkoou7vlzimRcl8cQYGO54JVcfl00iw7SlP5l'


from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import stripe
import base64
import json
import logging

logger = logging.getLogger(__name__)

class CreatePaymentIntent(APIView):
    permission_classes = [AllowAny]

    def price_calculations(self, items):
        """
        Calculates the total price based on items in the payload.
        Returns the total price if valid, otherwise raises a ValueError.
        """
        total_price = 0
        try:
            for item in items:
                item_type = item.get('type')
                if item_type == "bed":
                    total_price += item.get('price', 0) * item.get('nights', 0)
                elif item_type == "table":
                    total_price += item.get('price', 0)
                else:
                    raise ValueError("Invalid item type in payload.")
        except (TypeError, ValueError) as e:
            logger.error(f"Error in price calculation: {e}")
            raise ValueError("Invalid item structure or missing fields.")
        return total_price

    def post(self, request):
        """
        Handles POST requests to create a payment intent with Stripe.
        Decodes and validates incoming data, calculates the price, and creates a payment intent.
        """
        serializer = DataSerialize(data=request.data)
        
        if not serializer.is_valid():
            logger.warning("Invalid data provided to payment intent endpoint.")
            return Response({
                "error": "Invalid data",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # Extract and decode the token safely
        data_token = serializer.validated_data.get('data_token')
        try:
            decoded_bytes = base64.b64decode(data_token)
            decoded_str = decoded_bytes.decode('utf-8')
            items = json.loads(decoded_str)
        except (base64.binascii.Error, UnicodeDecodeError, json.JSONDecodeError) as e:
            logger.error(f"Failed to decode or parse data token: {e}")
            return Response({
                "error": "Invalid data token"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Calculate total price
        try:
            grand_price = self.price_calculations(items)
        except ValueError as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create Stripe customer and payment intent
        try:
            
            customer = stripe.Customer.create(
                name="Example Customer",
                email="example@test.com"  # Ideally should be passed in validated data
            )
            amount = int(grand_price * 100)  # Stripe expects amounts in cents
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
