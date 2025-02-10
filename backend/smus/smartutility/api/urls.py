from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

# Router for Booking API
router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('worker-search/', WorkerSearchView.as_view(), name='worker-search'),
    path('worker/availability/', update_availability, name="update-availability"),
    path('workers/available/', get_available_workers, name="available-workers"),
    path('booking/request/', request_booking, name="request-booking"),
    path('booking/update/<int:booking_id>/', update_booking_status, name="update-booking"),
    path("logout/", logout_user, name="logout"),
    path('', include(router.urls)),  # Includes all routes from the router
]
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns += [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('update-fcm-token/', update_fcm_token, name="update-fcm-token"),
     path("api/login/", login_user, name="login"),
]
