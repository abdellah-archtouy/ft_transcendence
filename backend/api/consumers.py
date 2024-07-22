from channels.generic.websocket import WebsocketConsumer
import json
from .serializer import MessageSerializer , Conversation ,UserSerializer
from Chat.models import Message , Conversation
from User.models import User
from asgiref.sync import async_to_sync
from django.db import transaction

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

        self.room_name = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.room_name}'
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # print(text_data)
        message_i = text_data_json.get('message', '')
        conversation_id = text_data_json.get('conversation', '')
        user_id = text_data_json.get('user', '')
        if isinstance(text_data_json, dict):
            msg = Message(conversation_id=conversation_id, user_id=user_id, message=message_i)
            msg.save()

        # Update the last message in the conversation
            try:
                with transaction.atomic():
                    conversation = Conversation.objects.filter(id=conversation_id).first()
                    if conversation:
                        conversation.last_message = message_i
                        conversation.save()
                        print(f"Updated conversation last message: {conversation.last_message}")
                    else:
                        print(f"Conversation with id {conversation_id} not found")
            except Exception as e:
                print(f"Error updating conversation: {e}")
        else:
            print("Received data is not a dictionary")
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': latest_message_data
            }
        )

    def chat_message(self, event):
        message = event['message']
        self.send(message)