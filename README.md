# Smart Utility Management System

## Overview
The **Smart Utility Management System** is a web-based platform that connects users with service providers such as plumbers, bike mechanics, electricians, luggage movers, house workers, and car mechanics. Users can book services based on availability and pricing, and workers can accept or reject job requests. The system ensures seamless interaction between users and service providers with real-time updates and review mechanisms.

## Features
- **User & Worker Authentication**: Secure sign-up and login for both users and service providers.
- **Worker Registration**: Service providers can register, set availability, and define pricing.
- **Job Request System**: Users can search for nearby workers and send job requests.
- **Booking Management**: Workers can accept/reject requests, and both parties receive contact details upon confirmation.
- **Real-Time Notifications**: Updates on booking status using WebSockets or Firebase.
- **Review & Rating System**: Users must provide feedback after service completion, which is visible on worker profiles.
- **Database Management**: Stores user, worker, booking, and review data efficiently.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Django (Python)
- **Database**: MySQL
- **Real-Time Notifications**: WebSockets or Firebase

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- Node.js & npm
- Python & pip
- MySQL

### Backend Setup (Django)
```bash
# Clone the repository
git clone https://github.com/your-repo/smart-utility-management.git
cd smart-utility-management/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Migrate database
python manage.py migrate

# Run the backend server
python manage.py runserver
```

### Frontend Setup (React + Vite)
```bash
cd ../frontend

# Install dependencies
npm install

# Run the frontend server
npm run dev
```

## Usage
1. **User Registration/Login**: Sign up and log in to access the platform.
2. **Service Provider Setup**: Workers can create profiles, set availability, and pricing.
3. **Booking Services**: Users can find service providers and send booking requests.
4. **Real-Time Updates**: Get notified about booking status.
5. **Service Completion & Review**: Users review workers after service completion.

## Future Enhancements
- AI-based worker recommendations
- Route optimization for workers
- Chat integration for seamless communication
- Wallet system for digital transactions

## Contributing
Feel free to contribute by raising issues or submitting pull requests.

## License
This project is licensed under the MIT License.

