from django.contrib.auth import get_user_model, authenticate
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.tokens import RefreshToken
import math

from .models import WorkerProfile, Worker, Booking
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    WorkerProfileSerializer,
    WorkerSerializer,
    BookingSerializer,
)
from .utils import send_notification

User = get_user_model()

# =============================
# User Authentication Endpoints
# =============================

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = User.objects.get(email=request.data["email"])

        # Automatically create a WorkerProfile for every new user
        WorkerProfile.objects.get_or_create(user=user)

        return response


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get("email")
        password = serializer.validated_data.get("password")

        user = authenticate(request, email=email, password=password)
        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        user_type = "worker" if WorkerProfile.objects.filter(user=user).exists() else "client"

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user_type": user_type,
                "username": user.username,  # 🔥 Add this line
                "email": user.email,
                "user_id": user.id,
            },
            status=status.HTTP_200_OK,
        )

@api_view(["POST"])
def login_user(request):
    """Login function (ensuring every user gets a WorkerProfile)."""
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Missing credentials"}, status=400)

    user = authenticate(email=email, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=400)

    # 🔥 Ensure every logged-in user has a WorkerProfile
    WorkerProfile.objects.get_or_create(user=user)

    refresh = RefreshToken.for_user(user)
    user_type = "worker" if WorkerProfile.objects.filter(user=user).exists() else "client"

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user_type": user_type,
            "username": user.username,
            "email": user.email,
            "user_id": user.id,
        },
        status=200,
    )



# ======================
# Worker Search Endpoint
# ======================

class WorkerSearchView(generics.ListAPIView):
    serializer_class = WorkerProfileSerializer

    def get_queryset(self):
        user_lat = self.request.query_params.get("lat")
        user_lng = self.request.query_params.get("lng")
        radius = self.request.query_params.get("radius", 5)

        if not user_lat or not user_lng:
            return WorkerProfile.objects.none()

        workers = WorkerProfile.objects.all()
        return [
            worker for worker in workers
            if self.calculate_distance(float(user_lat), float(user_lng), worker.location_lat, worker.location_lng) <= int(radius)
        ]

    def calculate_distance(self, lat1, lng1, lat2, lng2):
        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
        return 2 * math.asin(math.sqrt(a)) * 6371  # Earth radius in km


# ==========================
# Booking Management API
# ==========================

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_booking(request):
    """Booking request function (keeping URL unchanged)."""
    worker_id = request.data.get("worker_id")
    if not worker_id:
        return Response({"error": "Worker ID is required"}, status=400)

    worker = get_object_or_404(WorkerProfile, id=worker_id)
    booking = Booking.objects.create(user=request.user, worker=worker, status="pending")
    
    return Response({"message": "Booking request sent!", "booking_id": booking.id}, status=201)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_booking_status(request, booking_id):
    """Booking status update function (keeping URL unchanged)."""
    booking = get_object_or_404(Booking, id=booking_id, worker__user=request.user)
    new_status = request.data.get("status")

    if new_status not in ["accepted", "rejected"]:
        return Response({"error": "Invalid status"}, status=400)

    booking.status = new_status
    booking.save()
    send_notification(booking.user, f"Your booking with {booking.worker.user.username} is {new_status}.")
    return Response({"message": f"Booking {new_status}"})


# ==========================
# Worker Availability
# ==========================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_availability(request):
    worker = get_object_or_404(Worker, user=request.user)
    is_available = request.data.get("is_available")

    if is_available is not None:
        worker.is_available = is_available
        worker.save()
        return Response({"message": "Availability updated", "is_available": worker.is_available})

    return Response({"error": "Invalid request"}, status=400)


@api_view(["GET"])
def get_available_workers(request):
    workers = Worker.objects.filter(is_available=True)
    serializer = WorkerSerializer(workers, many=True)
    return Response(serializer.data)


# =====================
# Firebase FCM Tokens
# =====================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_fcm_token(request):
    """Updates FCM token for push notifications."""
    user = request.user
    token = request.data.get("fcm_token")

    if token:
        user.fcm_token = token
        user.save()
        return Response({"message": "FCM token updated successfully"})

    return Response({"error": "Invalid request"}, status=400)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout function to blacklist refresh token."""
    try:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=400)
        
        token = RefreshToken(refresh_token)
        token.blacklist()  # Blacklist token so it can't be used again

        return Response({"message": "Logout successful"}, status=200)
    except Exception as e:
        return Response({"error": "Invalid token or request"}, status=400)
