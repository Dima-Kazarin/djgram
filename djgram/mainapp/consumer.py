import json
from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import WebsocketConsumer, JsonWebsocketConsumer
from django.contrib.auth import get_user_model

from .models import Like, Chat, Message

User = get_user_model()


class LikeConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.post_id = None

    def connect(self):
        self.post_id = self.scope['url_route']['kwargs']['post_id']
        self.room_group_name = f'likes_{self.post_id}'
        self.accept()

        like_count = Like.objects.filter(post_id=self.post_id).count()
        self.send(json.dumps({'post_id': self.post_id, 'like_count': like_count}))

        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)

    def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        if message_type in ('like_added', 'like_removed'):
            post_id = text_data_json.get('post_id')
            like_count = text_data_json.get('like_count')

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_like_update',
                    'post_id': post_id,
                    'like_count': like_count
                }
            )

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

    def send_like_update(self, event):
        self.send(text_data=json.dumps({
            'post_id': event['post_id'],
            'like_count': event['like_count']
        }))


class ChatConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.chat_id = None
        self.user = None
        self.is_member = None

    def connect(self):
        self.user = self.scope['user']
        self.accept()

        # if not self.user.is_authenticated:
        #     self.close(code=4001)

        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'message_{self.chat_id}'

        chat = Chat.objects.get(id=self.chat_id)

        messages = Message.objects.filter(chat_id=self.chat_id)
        messages_list = [
            {'id': message.id,
             'content': message.content,
             'created_at': message.created_at.isoformat(),
             'sender': message.sender.id,
             }
            for message in messages]

        # self.is_member = chat.member.filter(id=self.user.id).exists()

        self.send(json.dumps({'messages_list': messages_list}))

        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)

    def receive_json(self, content, **kwargs):

        # if not self.is_member:
        #     return self.user.id

        chat_id = self.chat_id
        sender = self.user
        chat = Chat.objects.get(id=chat_id)
        message = content['content']

        new_message = Message.objects.create(sender=sender, content=message, chat=chat)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'messages_list': [{
                    'id': new_message.id,
                    'sender': new_message.sender.username,
                    'content': new_message.content,
                    'created_at': new_message.created_at.isoformat()
                }]
            }
        )

    def chat_message(self, event):
        self.send_json({'messages_list': event['messages_list']})

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)
        super().disconnect(code)
