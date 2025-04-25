from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model


class User(AbstractUser):
    icon = models.ImageField(upload_to='icon/', null=True, blank=True, default='icon/default.png')


class Post(models.Model):
    image = models.ImageField(upload_to='photo/', null=True, blank=True)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    author = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.author.username} - {self.id}'


class Like(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f'Like {self.post.id} by {self.user.username}'

    class Meta:
        unique_together = ('user', 'post')


class Comment(models.Model):
    text = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class Chat(models.Model):
    name = models.CharField(max_length=100)
    member = models.ManyToManyField(settings.AUTH_USER_MODEL)

    def __str__(self):
        return self.name


class Message(models.Model):
    sender = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)

    class Meta:
        ordering = ['created_at']


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.followed == self.follower:
            raise ValidationError('You cannot follow yourself')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.follower} follows {self.followed}'
