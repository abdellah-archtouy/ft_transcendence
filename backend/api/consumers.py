from channels.generic.websocket import WebsocketConsumer
import json
from .serializer import MessageSerializer , Conversation ,UserSerializer , ConvSerializer
from Chat.models import Message , Conversation
from User.models import User
from asgiref.sync import async_to_sync
from django.core.serializers import serialize
from django.db import transaction
from django.db.models import Q
import datetime

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

        message_i = text_data_json.get('message', '')
        conversation_id = text_data_json.get('conversation', '')
        user_id = text_data_json.get('user', '')
        if isinstance(text_data_json, dict):
            msg = Message(conversation_id=conversation_id, user_id=user_id, message=message_i)
            msg.save()

            try:
                with transaction.atomic():
                    conversation = Conversation.objects.filter(id=conversation_id).first()
                    if conversation:
                        conversation.last_message = message_i
                        conversation.last_message_time = datetime.datetime.now()
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
                'message': text_data
            }
        )

    def chat_message(self, event):
        message = event['message']
        self.send(message)


class AddConvConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()


    def disconnect(self, close_code):
        pass


    def receive(self, text_data):
        print(text_data)
        text_data_json = json.loads(text_data)
        user_id_str = text_data_json.get('user', '')
        user1_id_str = text_data_json.get('user1', '')
        user_id = int(user_id_str)
        user1_id = int(user1_id_str)

        user1 = User.objects.filter(id=user1_id).first()
        user2 = User.objects.filter(id=user_id).first()

        # Query for conversation between user_id and user1_id in either direction
        conv = Conversation.objects.filter(
            (Q(uid1=user_id) & Q(uid2=user1_id)) |
            (Q(uid1=user1_id) & Q(uid2=user_id))
        ).first()

        if conv:
            print("Conversation already exists")
            serializer = ConvSerializer(conv)
            conv_data = serializer.data
            print(f"Conversation data: {conv_data}")
            response = {'conversation': conv_data}
            self.send(text_data=json.dumps(response))
        else:
        # Create new conversation
            conversation = Conversation(uid1=user1, uid2=user2, last_message='')
            conversation.save()
            serializer = ConvSerializer(conversation)
            conv_data = serializer.data
            response = {'conversation': conv_data}
            print(f"Created new conversation: {conversation}")

            self.send( text_data=json.dumps(response))

class DataConsumer(WebsocketConsumer):
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

        message_i = text_data_json.get('message', '')
        conversation_id = text_data_json.get('conversation', '')
        user_id = text_data_json.get('user', '')
        if isinstance(text_data_json, dict):
            msg = Message(conversation_id=conversation_id, user_id=user_id, message=message_i)
            msg.save()

            try:
                with transaction.atomic():
                    conversation = Conversation.objects.filter(id=conversation_id).first()
                    if conversation:
                        conversation.last_message = message_i
                        conversation.last_message_time = datetime.datetime.now()
                        conversation.save()
                        print(f"Updated conversation last message: {conversation.last_message}")
                    else:
                        print(f"Conversation with id {conversation_id} not found")
            except Exception as e:
                print(f"Error updating conversation: {e}")
        else:
            print("Received data is not a dictionary")
        convdata = ConvSerializer(Conversation.objects.all(), many=True)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': text_data,
                # 'data': convdata.data
            }
        )

    def chat_message(self, event):
        message = event['message']
        print(event)
        self.send(message)
    def data_send(self, event):
        message = event['data']
        self.send(message)
