import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Like, Post


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

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

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

    def send_like_update(self, event):
        self.send(text_data=json.dumps({
            'post_id': event['post_id'],
            'like_count': event['like_count']
        }))
