from rest_framework import serializers

class DataSerialize(serializers.Serializer):
    data_token = serializers.CharField()
