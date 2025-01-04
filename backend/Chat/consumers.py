from channels.generic.websocket import WebsocketConsumer
import json
from .serializer import MessageSerializer , Conversation ,UserSerializer , ConvSerializer , BlockMuteSerializer
from Chat.models import Message , Conversation , Block_mute
from User.models import User
from asgiref.sync import async_to_sync
from django.core.serializers import serialize
from django.db import transaction
from django.db.models import Q
import datetime
from django.conf import settings
import jwt
from Notifications.views import create_notification

class AddConvConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()


    async def disconnect(self, code):
        if self.room_group_name and self.channel_name:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        user_id_str = text_data_json.get('user', '')
        user1_id_str = text_data_json.get('user1', '')
        user_id = int(user_id_str)
        user1_id = int(user1_id_str)
        user1 = User.objects.filter(id=user1_id).first()
        user2 = User.objects.filter(id=user_id).first()
        if user1 == user2:
            print("Cannot create conversation with self")
            return
        conv = Conversation.objects.filter(
            (Q(uid1=user_id) & Q(uid2=user1_id)) |
            (Q(uid1=user1_id) & Q(uid2=user_id))
        ).first()
        if conv:
            print("Conversation already exists")
            serializer = ConvSerializer(conv)
            data_return =  {
            "id": serializer.data["id"],
            "uid1": serializer.data["uid1"],
            "uid2": serializer.data["uid2"],
            "last_message": serializer.data["last_message"],
            "last_message_time": serializer.data["last_message_time"],
            "uid2_info": serializer.data["uid2_info"] if serializer.data["uid1"] == user1.id else serializer.data["uid1_info"],
            "conv_username": serializer.data["uid2_info"]["username"] if serializer.data["uid1"] == user1.id else serializer.data["uid1_info"]["username"],
            }
            response = {'conversation': data_return}
            self.send(text_data=json.dumps(response))
        else:
            conversation = Conversation(uid1=user1, uid2=user2, last_message='')
            conversation.save()
            serializer = ConvSerializer(conversation)
            data_return =  {
            "id": serializer.data["id"],
            "uid1": serializer.data["uid1"],
            "uid2": serializer.data["uid2"],
            "last_message": serializer.data["last_message"],
            "last_message_time": serializer.data["last_message_time"],
            "uid2_info": serializer.data["uid2_info"] if serializer.data["uid1"] == user1.id else serializer.data["uid1_info"],
            "conv_username": serializer.data["uid2_info"]["username"] if serializer.data["uid1"] == user1.id else serializer.data["uid1_info"]["username"],
            }
            response = {'conversation': data_return}
            self.send( text_data=json.dumps(response))

class DataConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        user_id = self.scope['url_route']['kwargs']['accessToken']
        user = User.objects.get(id=user_id)
        self.room_name = user.username
        self.room_group_name = f'chat_{self.room_name}'
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

    def disconnect(self, code):
        if self.room_group_name and self.channel_name:
            async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', '')
        # link
        conversation_id = text_data_json.get('conversation', '')
        msg_type = text_data_json.get('msg_type', '')
        user_id = text_data_json.get('user', '')
        if msg_type == 'invite':
            link = message
            message = "PLAY NOW !!"
        else:
            link = ""
        if isinstance(text_data_json, dict):
            msg = Message(conversation_id=conversation_id, user_id=user_id, message=message, msg_type=msg_type, invite_room_name=link)
            msg.save()
            try:
                with transaction.atomic():
                    conversation = Conversation.objects.filter(id=conversation_id).first()
                    if conversation:
                        conversation.last_message = message
                        conversation.last_message_time = datetime.datetime.now()
                        conversation.save()
                        if user_id == conversation.uid1.id:
                            user2_id = conversation.uid2.id
                        else:
                            user2_id = conversation.uid1.id
                    else:
                        print(f"Conversation with id {conversation_id} not found")
            except Exception as e:
                print(f"Error updating conversation: {e}")
        else:
            print("Received data is not a dictionary")
        
        convdata = ConvSerializer(conversation , many=False)
        user2 = User.objects.get(id=user2_id)
        user1 = User.objects.get(id=user_id)
        link = f"/chat?convid={convdata.data['id']}"
        muteins = Block_mute.objects.filter(user1=user2, user2=user1).first()
        muteserialzer = BlockMuteSerializer(muteins)
        if muteserialzer.data["mute"] == False:
            create_notification(user2, user1, "CHAT_MESSAGE", link=link)
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
                "conv_username":  conv["uid2_info"]["username"] if conv["uid1"] == user_id else conv["uid1_info"]["username"],
            }
            for conv in serializer.data
        ]
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
                "uid2_info": conv["uid2_info"] if conv["uid1"] != user_id else conv["uid1_info"],
                "conv_username": conv["uid2_info"]["username"] if conv["uid1"] != user_id else conv["uid1_info"]["username"],
            }
            for conv in serializer2.data
                if conv['last_message'] != ""
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
        self.send(text_data=json.dumps({
            'message': message,
            'data': data,
        }))
    def data_send(self, event):
        message = event['data']
        self.send(message)
