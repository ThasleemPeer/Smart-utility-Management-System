from django.contrib.auth import get_user_model, authenticate
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.tokens import RefreshToken
import math
from.serializers import *
from .models import WorkerProfile,  Booking
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    WorkerProfileSerializer,
    BookingSerializer,
)
from .utils import send_notification

User = get_user_model()

# =============================
# User Authentication Endpoints
# =============================

from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User, WorkerProfile
from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Validate the data

        user = serializer.save()  # Save the user

        # Only create a WorkerProfile if the user is a worker
        if user.user_type == "worker":
            WorkerProfile.objects.get_or_create(user=user)

        return Response(serializer.data, status=201)  # Return the created user data
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


class WorkerProfileListView(generics.ListAPIView):
    serializer_class = WorkerProfileSerializer

    def get_queryset(self):
        return WorkerProfile.objects.filter(is_available=True).select_related("user")

# ==========================
# Booking Management API
# ==========================

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]




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


# @api_view(["GET"])
# def get_available_workers(request):
#     workers = Worker.objects.filter(is_available=True)
#     serializer = WorkerSerializer(workers, many=True)
#     return Response(serializer.data)


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


from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Booking, WorkerProfile
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

@method_decorator(login_required, name="dispatch")
def worker_requests(request, worker_id):
    worker_profile = get_object_or_404(WorkerProfile, user_id=worker_id)

    job_requests = Booking.objects.filter(worker=worker_profile, status="pending").values(
        "id", "user__username", "user__phone", "status", "timestamp"
    )

    return JsonResponse(list(job_requests), safe=False)
@csrf_exempt
def request_action(request, request_id, action):
    if request.method == "POST":
        booking = get_object_or_404(Booking, id=request_id)

        if action == "accept":
            booking.status = "accepted"
        elif action == "reject":
            booking.status = "rejected"
        else:
            return JsonResponse({"error": "Invalid action"}, status=400)

        booking.save()
        return JsonResponse({"message": f"Request {action}ed successfully"})

    return JsonResponse({"error": "Invalid request method"}, status=405)



# fetch worker by id
@api_view(['GET'])
def get_worker_by_id(request, worker_id):
    worker = get_object_or_404(WorkerProfile, id=worker_id)
    serializer = WorkerProfileSerializer(worker)
    return Response(serializer.data)

# updating worker profile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import WorkerProfile
from .serializers import WorkerProfileUpdateSerializer
import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import WorkerProfile
from .serializers import WorkerProfileUpdateSerializer

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_worker_by_email(request, email):
    try:
        worker = get_object_or_404(WorkerProfile, user__email=email)
        serializer = WorkerProfileUpdateSerializer(worker, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse({"message": "Worker updated successfully!", "data": serializer.data}, status=200)
        return JsonResponse({"error": serializer.errors}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request, worker_id):
    print("Received Data:", request.data)  # Debugging Line
    
    worker = get_object_or_404(WorkerProfile, id=worker_id)
    data = request.data.copy()
    data['worker'] = worker.id  # Ensure worker ID is included in request data
    data['user'] = request.user.id  # Automatically associate user
    
    serializer = BookingSerializer(data=data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    print("Errors:", serializer.errors)  # Debugging Line
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from .models import Booking, WorkerProfile
from .serializers import BookingSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def worker_bookings(request):
    """Get all bookings for a specific worker based on worker_id"""
    worker_id = request.GET.get('worker_id')  # Get worker_id from request

    if not worker_id:
        return Response({'error': 'Worker ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure the worker exists
    worker_profile = get_object_or_404(WorkerProfile, id=worker_id)

    # Fetch bookings for this specific worker
    bookings = Booking.objects.filter(worker=worker_profile).order_by('-timestamp')

    return Response({
        'count': bookings.count(),
        'bookings': BookingSerializer(bookings, many=True).data
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_booking_status(request, booking_id):
    """Update booking status (worker accept/reject)"""
    try:
        worker_profile = request.user.worker_profile
    except WorkerProfile.DoesNotExist:
        return Response({'error': 'User is not a worker'}, status=status.HTTP_403_FORBIDDEN)
    
    booking = get_object_or_404(Booking, id=booking_id, worker=worker_profile)
    
    new_status = request.data.get('status', '').lower()
    if new_status not in ['accepted', 'rejected']:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    booking.status = new_status
    booking.save()
    
    return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)
   

