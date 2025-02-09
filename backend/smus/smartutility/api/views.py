from django.contrib.auth import get_user_model, authenticate
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *
from .models import WorkerProfile
import math


User  = get_user_model()  # This will get the custom user model

# User Registration API
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

# User Login API (JWT Token Generation)
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkerSearchView(generics.ListAPIView):
    serializer_class = WorkerProfileSerializer

    def get_queryset(self):
        user_lat = self.request.query_params.get('lat')
        user_lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius', 5)  # Default radius:  5 km

        if not user_lat or not user_lng:
            return WorkerProfile.objects.none()  # No workers if location isn't provided

        workers = WorkerProfile.objects.all()
        nearby_workers = []

        for worker in workers:
            distance = self.calculate_distance(float(user_lat), float(user_lng), worker.location_lat, worker.location_lng)
            if distance <= int(radius):
                nearby_workers.append(worker)

        return nearby_workers

    def calculate_distance(self, lat1, lng1, lat2, lng2):
        # Haversine formula to calculate distance between two coordinates
        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2)**2
        c = 2 * math.asin(math.sqrt(a))
        radius = 6371  # Earth's radius in kilometers
        return c * radius


from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from api.models import Booking, WorkerProfile
from api.serializers import *

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    # API to request a worker
    @action(detail=False, methods=['post'], url_path='request_worker')
    def request_worker(self, request):
        user = request.user
        worker_id = request.data.get('worker_id')

        if not worker_id:
            return Response({"error": "Worker ID is required"}, status=400)

        try:
            worker = WorkerProfile.objects.get(id=worker_id)
            booking = Booking.objects.create(user=user, worker=worker, status='pending')
            return Response({"message": "Booking request sent!", "booking_id": booking.id}, status=201)
        except WorkerProfile.DoesNotExist:
            return Response({"error": "Worker not found"}, status=404)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        try:
            booking = Booking.objects.get(id=pk, worker__user=request.user)
            new_status = request.data.get('status')

            if new_status in ['accepted', 'rejected']:
                booking.status = new_status
                booking.save()
                return Response({'message': f'Booking {new_status}'})
            else:
                return Response({'error': 'Invalid status'}, status=400)

        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=404)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Worker
from .serializers import WorkerSerializer

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_availability(request):
    worker = Worker.objects.get(user=request.user)
    is_available = request.data.get("is_available")

    if is_available is not None:
        worker.is_available = is_available
        worker.save()
        return Response({"message": "Availability updated", "is_available": worker.is_available})
    
    return Response({"error": "Invalid request"}, status=400)

@api_view(['GET'])
def get_available_workers(request):
    workers = Worker.objects.filter(is_available=True)
    serializer = WorkerSerializer(workers, many=True)
    return Response(serializer.data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_booking(request):
    worker_id = request.data.get("worker_id")
    
    try:
        worker = Worker.objects.get(id=worker_id, is_available=True)
    except Worker.DoesNotExist:
        return Response({"error": "Worker not available"}, status=400)

    booking = Booking.objects.create(user=request.user, worker=worker, status='pending')
    return Response({"message": "Booking request sent", "booking_id": booking.id})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_booking_status(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id, worker__user=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)

    new_status = request.data.get("status")
    if new_status not in ['accepted', 'rejected']:
        return Response({"error": "Invalid status"}, status=400)

    booking.status = new_status
    booking.save()

    if new_status == "accepted":
        return Response({"message": "Booking accepted", "user_contact": booking.user.email, "worker_contact": booking.worker.user.email})
    else:
        return Response({"message": "Booking rejected"})




#notification part
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from api.models import Notification

def send_notification(user, message):
    # Save to DB
    Notification.objects.create(user=user, message=message)

    # Send via WebSocket
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_{user.id}",
        {"type": "send_notification", "message": message}
    )

from api.models import Booking
from api.utils import send_notification  # Import the function

def confirm_booking(request, booking_id):
    booking = Booking.objects.get(id=booking_id)
    worker = booking.worker
    user = booking.user

    send_notification(worker, f"You have a new booking from {user.username}!")
    send_notification(user, f"Your booking request was sent to {worker.username}.")


#firebase
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models import User

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_fcm_token(request):
    user = request.user
    token = request.data.get("fcm_token")

    if token:
        user.fcm_token = token
        user.save()
        return Response({"message": "FCM token updated successfully"})
    return Response({"error": "Invalid request"}, status=400)

from api.utils import send_notification

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_booking_status(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id, worker__user=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)

    new_status = request.data.get("status")
    if new_status not in ['accepted', 'rejected']:
        return Response({"error": "Invalid status"}, status=400)

    booking.status = new_status
    booking.save()

    # Send notification to user
    if new_status == "accepted":
        send_notification(booking.user, f"Your booking with {booking.worker.user.username} is accepted!")
    else:
        send_notification(booking.user, f"Your booking with {booking.worker.user.username} was rejected.")

    return Response({"message": f"Booking {new_status}"})

from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token

@api_view(["POST"])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")

    user = authenticate(username=email, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "message": "Login successful"})
    return Response({"error": "Invalid credentials"}, status=400)
