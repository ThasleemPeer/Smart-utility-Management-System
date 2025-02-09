from django.contrib.auth.models import AbstractUser  
from django.db import models
from django.conf import settings  # Import settings to use AUTH_USER_MODEL

# Custom User Model
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    USER_TYPES = (
        ('worker', 'Worker'),
        ('user', 'User'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPES)
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    fcm_token = models.TextField(null=True, blank=True)  # Store Firebase token

# Worker Profile Model
class WorkerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='worker_profile')
    service_type = models.CharField(max_length=100)  # e.g., Plumber, Electrician
    hourly_rate_weekday = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    hourly_rate_weekend = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    location_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.service_type}"

# Booking Model
class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    worker = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE, related_name="bookings")  # Corrected reference
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} -> {self.worker.user.username} ({self.status})"

# Chat Message Model
class ChatMessage(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_messages")
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.message[:30]}"

# Worker Model
class Worker(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.CharField(max_length=255)
    is_available = models.BooleanField(default=True)  # Toggle availability
    working_hours = models.JSONField(default=dict)  # {"weekday": "9 AM - 6 PM", "weekend": "10 AM - 4 PM"}

    def __str__(self):
        return self.user.username
    




class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.message[:30]}"
