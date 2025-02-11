from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import WorkerProfile
from django.contrib.auth import authenticate
User = get_user_model()

# User Registration Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'user_type', 'phone']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# Login Serializer (Generates JWT Token)
from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        return data
# Worker Profile Serializer
class WorkerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerProfile
        fields = '__all__'
from rest_framework import serializers
from api.models import Booking

class BookingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # Show username instead of ID
    worker = serializers.StringRelatedField(read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    updated_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'worker', 'status', 'created_at', 'updated_at', 'scheduled_time', 'notes']


from .models import WorkerProfile

from rest_framework import serializers
from .models import WorkerProfile

class WorkerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)  # 🔥 Include username

    class Meta:
        model = WorkerProfile
        fields = [
            "id",
            "username",  # 🔥 Add worker's name
            "service_type",  # 🔥 Include service type
            "hourly_rate_weekday",
            "hourly_rate_weekend",
            "location_lat",
            "location_lng",
            "is_available",
        ]


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'user', 'worker', 'status', 'timestamp']

from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "password", "phone", "user_type"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
