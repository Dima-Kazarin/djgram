from django.core.cache import cache
from rest_framework import serializers

from .models import User, Post, Like, Comment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')


class PostSerializer(serializers.ModelSerializer):
    like_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'image', 'description', 'created_at', 'author', 'like_count')

    def get_like_count(self, obj):
        cache_key = f'post_likes:{obj.id}'
        like_count = cache.get(cache_key)

        if like_count is None:
            like_count = Like.objects.filter(post=obj).count()
            cache.set(cache_key, like_count, timeout=60)

        return like_count


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user
