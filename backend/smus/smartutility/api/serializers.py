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

from rest_framework import serializers
from .models import WorkerProfile, Booking
from django.contrib.auth import get_user_model

User = get_user_model()

class BookingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    worker = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'


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


from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    worker_name = serializers.CharField(source="worker.user.username", read_only=True)
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'user', 'worker', 'user_name', 'worker_name', 'status', 'timestamp', 'date', 'time']

    def get_date(self, obj):
        return obj.timestamp.date()  # Extracts only the date part

    def get_time(self, obj):
        return obj.timestamp.time().strftime('%H:%M:%S')
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

#worker details editing
from rest_framework import serializers
from .models import WorkerProfile

class WorkerProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False)  # Optional username update

    class Meta:
        model = WorkerProfile
        fields = ['username', 'hourly_rate_weekday', 'hourly_rate_weekend', 'is_available', 'service_type']

    def update(self, instance, validated_data):
        # Update username if provided
        username = validated_data.pop('username', None)
        if username:
            instance.user.username = username
            instance.user.save()

        # Update WorkerProfile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
