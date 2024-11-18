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
from django.conf import settings
import jwt

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

        access_token = self.scope['url_route']['kwargs']['accessToken']

        if access_token:
            # get user id from the access token by decoding it
            user_id = jwt.decode(access_token, settings.SECRET_KEY, algorithms=["HS256"])["user_id"]
            print(f"User id: {user_id}")

            user = User.objects.get(id=user_id)
            print(f"User: {user.username}")


        

        self.room_name = user.username
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
                        if user_id == conversation.uid1.id:
                            user2_id = conversation.uid2.id
                        else:
                            user2_id = conversation.uid1.id
                        print(f"Updated conversation last message: {conversation.last_message}")
                    else:
                        print(f"Conversation with id {conversation_id} not found")
            except Exception as e:
                print(f"Error updating conversation: {e}")
        else:
            print("Received data is not a dictionary")
        
        convdata = ConvSerializer(conversation , many=False)
        conv_instances = Conversation.objects.filter(uid1=user_id) | Conversation.objects.filter(
        uid2=user_id
        )
        conv_instances = conv_instances.order_by(
        "-last_message_time"
        )
        serializer = ConvSerializer(conv_instances, many=True)
        data_return = [
            {
                "id": conv["id"],
                "uid1": conv["uid1"],
                "uid2": conv["uid2"],
                "last_message": conv["last_message"],
                "last_message_time": conv["last_message_time"],
                "uid2_info": conv["uid2_info"] if conv["uid1"] == user_id else conv["uid1_info"],
                "conv_username": conv["uid2_info"]["username"] if conv["uid1"] == user_id else conv["uid1_info"]["username"],
            }
            for conv in serializer.data
        ]
        user2 = User.objects.get(id=user2_id)
        conv_instances2 = Conversation.objects.filter(uid1=user2) | Conversation.objects.filter(
        uid2=user2
        )
        conv_instances2 = conv_instances2.order_by(
        "-last_message_time"
        )
        serializer2 = ConvSerializer(conv_instances2, many=True)
        data_return_user2 = [
            {
                "id": conv["id"],
                "uid1": conv["uid1"],
                "uid2": conv["uid2"],
                "last_message": conv["last_message"],
                "last_message_time": conv["last_message_time"],
                "uid2_info": conv["uid2_info"] if conv["uid1"] == user_id else conv["uid1_info"],
                "conv_username": conv["uid2_info"]["username"] if conv["uid1"] == user_id else conv["uid1_info"]["username"],
            }
            for conv in serializer2.data
        ]
        async_to_sync(self.channel_layer.group_send)(
            f'chat_{user2.username}',
            {
                'type': 'chat_message',
                'message': text_data,
                'data': data_return_user2
            }
        )
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': text_data,
                'data': data_return
            }
        )

    def chat_message(self, event):
        message = event['message']
        data = event['data']

        # Convert the dictionary to a JSON string
        self.send(text_data=json.dumps({
            'message': message,
            'data': data,
        }))
    def data_send(self, event):
        message = event['data']
        self.send(message)
