from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *  # Import all views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .consumers import *
# Router for Booking API
router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

# All URL patterns should be in one list
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('worker-search/', WorkerSearchView.as_view(), name='worker-search'),
    path('worker/availability/', update_availability, name="update-availability"),
    path('workers/available/', WorkerProfileListView.as_view(), name="available-workers"),
    path('logout/', logout_user, name="logout"),
    path('worker/<int:worker_id>/', get_worker_by_id, name='get_worker_by_id'),
    path('worker/<str:email>/update/', update_worker_by_email, name="update_worker_by_email"),
    path('update-fcm-token/', update_fcm_token, name="update-fcm-token"),
    path('booking/request/<int:worker_id>/', create_booking, name='create_booking'),
    # path('booking/update/<int:booking_id>/', update_booking_status, name='update_booking_status'),
     path('api/bookings/', worker_bookings, name='worker-bookings'),
    path("bookings/<int:booking_id>/update/", update_booking_status, name="update_booking_status"),
    path("ws/chat/<int:booking_id>/", ChatConsumer.as_asgi()),
    path('', include(router.urls)),  # Includes all routes from the router

    # JWT Token Authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('update-fcm-token/', update_fcm_token, name="update-fcm-token"),
]
