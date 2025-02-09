import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass  # Handle disconnection if needed

    async def receive(self, text_data):
        if not text_data:  # Check if the message is empty
            print("Received empty message, ignoring...")
            return
        print("data", text_data)

        try:
            data = json.loads(text_data)
            message = data.get("message", "")  # Extract message safely

            if message:
                await self.send(text_data=json.dumps({"message": message}))  # Send response
            else:
                print("Received JSON without a message key")

        except json.JSONDecodeError:
            print("Received invalid JSON, ignoring...")

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.group_name = f"notifications_{self.user_id}"

        print(f"User {self.user_id} connecting to {self.group_name}")  # Debugging log

        # Add to the group once
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        # Accept the connection once
        await self.accept()  # This should be called only once

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({"message": event["message"]}))