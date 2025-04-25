from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.viewsets import ViewSet
from django.core.cache import cache
from django.db import connection

from .models import User, Like, Post, Comment, Chat, Message, Follow
from .serializers import CommentSerializer, ChatSerializer, MessageSerializer, LikeSerializer, PostSerializer, \
    UserSerializer, RegisterSerializer, FollowSerializer
from .schemas import post_docs, like_docs, comment_docs, user_docs, chat_docs, member_docs, message_docs, follow_docs, \
    count_follow_docs, count_following_docs, count_post_docs


class PostViewSet(ViewSet):
    # permission_classes = [IsAuthenticated, ]
    @post_docs
    def list(self, request):
        connection.queries.clear()

        queryset = Post.objects.all()

        by_post_id = request.query_params.get('by_post_id')
        by_user_id = request.query_params.get('by_user_id')

        if by_post_id:
            queryset = queryset.filter(id=by_post_id)

        if by_user_id:
            queryset = queryset.filter(author_id=by_user_id)

        serializer = PostSerializer(queryset, many=True)
        response = serializer.data
        print(f'sadasda {len(connection.queries)}')
        return Response(response)

    @extend_schema(request=PostSerializer, tags=['Post'])
    def create(self, request):
        data = request.data.copy()
        data['author'] = request.user.id
        serializer = PostSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(request=PostSerializer, tags=['Post'])
    def destroy(self, request, pk=None):
        obj = get_object_or_404(Post, pk=pk)
        obj.delete()
        cache.delete(f'post_likes:{obj.id}')
        return Response(status=status.HTTP_200_OK)


class LikeViewSet(ViewSet):
    @like_docs
    def list(self, request):
        queryset = Like.objects.all()

        by_post_id = request.query_params.get('by_post_id')
        by_user_id = request.query_params.get('by_user_id')

        if by_post_id:
            queryset = queryset.filter(post_id=by_post_id)

        if by_user_id:
            queryset = queryset.filter(user_id=by_user_id)

        serializer = LikeSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(request=LikeSerializer, tags=['Like'])
    def create(self, request):
        connection.queries.clear()

        data = request.data.copy()
        data['user'] = request.user.id
        serializer = LikeSerializer(data=data)

        if serializer.is_valid():
            like = serializer.save()

            cache_key = f'post_likes:{like.post.id}'

            if cache.get(cache_key) is None:
                cache.set(cache_key, 0)

            cache.incr(cache_key)
            print(f'sadasda {len(connection.queries)}')

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(request=LikeSerializer, tags=['Like'])
    def destroy(self, request, pk=None):
        obj = get_object_or_404(Like, pk=pk)

        post_id = obj.post.id
        obj.delete()

        cache_key = f'post_likes:{post_id}'

        if cache.get(cache_key) is None:
            cache.set(cache_key, 0)

        cache.decr(cache_key)

        return Response(status=status.HTTP_200_OK)


class CommentViewSet(ViewSet):
    @comment_docs
    def list(self, request):
        queryset = Comment.objects.all()

        by_post_id = request.query_params.get('by_post_id')

        if by_post_id:
            queryset = queryset.filter(id=by_post_id)

        serializer = CommentSerializer(queryset, many=True)

        return Response(serializer.data)

    @extend_schema(request=CommentSerializer, tags=['Comment'])
    def create(self, request):
        serializer = CommentSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(request=CommentSerializer, tags=['Comment'])
    def destroy(self, request, pk=None):
        obj = get_object_or_404(Comment, pk=pk)
        obj.delete()
        return Response(status=status.HTTP_200_OK)


class ChatViewSet(ViewSet):
    @chat_docs
    def list(self, request):
        queryset = Chat.objects.all()

        by_id = request.query_params.get('by_id')

        if by_id:
            queryset = queryset.filter(id=by_id)

        by_member_id = request.query_params.get('by_member_id')

        if by_member_id:
            queryset = queryset.filter(member=by_member_id)

        serializer = ChatSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(request=ChatSerializer, tags=['Messages'])
    def create(self, request):
        serializer = ChatSerializer(data=request.data, partial=True)

        if serializer.is_valid():
            chat = serializer.save()
            chat.member.add(request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(request=ChatSerializer, tags=['Messages'])
    def destroy(self, request, pk):
        obj = get_object_or_404(Chat, pk=pk)
        obj.delete()
        return Response(status=status.HTTP_200_OK)


class ChatMembershipViewSet(ViewSet):
    @member_docs
    def create(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id)
        user = request.user

        if chat.member.filter(id=user.id).exists():
            return Response({'error': 'User is already a member'}, status=status.HTTP_409_CONFLICT)

        chat.member.add(user)

        return Response({'message': 'User joined server successfully'}, status=status.HTTP_200_OK)


class MessageViewSet(ViewSet):
    @message_docs
    def list(self, request):
        queryset = Message.objects.all()

        by_chat_id = request.query_params.get('by_chat_id')

        if by_chat_id:
            queryset = queryset.filter(chat_id=by_chat_id)

        serializer = MessageSerializer(queryset, many=True)

        return Response(serializer.data)

    @extend_schema(request=MessageSerializer, tags=['Messages'])
    def create(self, request):
        data = request.data.copy()
        data['sender'] = request.user.id

        serializer = MessageSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class FollowViewSet(ViewSet):
    @follow_docs
    def list(self, request):
        queryset = Follow.objects.all()

        by_followed_id = request.query_params.get('by_followed_id')
        by_follower_id = request.query_params.get('by_follower_id')

        if by_followed_id:
            queryset = queryset.filter(followed_id=by_followed_id)

        if by_follower_id:
            queryset = queryset.filter(follower_id=by_follower_id)

        serializer = FollowSerializer(queryset, many=True)

        return Response(serializer.data)

    @extend_schema(request=FollowSerializer, tags=['Follow'])
    def create(self, request):
        data = request.data.copy()
        data['follower'] = request.user.id

        serializer = FollowSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)


@count_follow_docs
@api_view(['GET'])
def count_followers(request, followed_id=None):
    count = Follow.objects.filter(followed_id=followed_id).count()
    print(followed_id)
    return Response({'followers_count': count})


@count_following_docs
@api_view(['GET'])
def count_following(request, follower_id=None):
    count = Follow.objects.filter(follower_id=follower_id).count()
    return Response({'following_count': count})


@count_post_docs
@api_view(['GET'])
def count_posts(request, user_id=None):
    count = Post.objects.filter(author_id=user_id).count()
    return Response({'posts_count': count})


@extend_schema(request=FollowSerializer, tags=['Follow'])
@api_view(['DELETE'])
def unsubscribe(request, follower_id=None, followed_id=None):
    obj = Follow.objects.get(follower_id=follower_id, followed_id=followed_id)
    obj.delete()
    return Response(status=status.HTTP_200_OK)


@user_docs
@api_view(['GET'])
def get_username_by_id(request):
    queryset = User.objects.all().order_by('id')

    by_id = request.query_params.get('by_id')

    if by_id:
        queryset = queryset.filter(id=by_id)

    serializer = UserSerializer(queryset, many=True)
    return Response(serializer.data)


@extend_schema(request=RegisterSerializer, tags=['Auth'])
@api_view(['POST'])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(responses=None, tags=['User'])
@api_view(['GET'])
def get_current_user(request):
    queryset = User.objects.filter(id=request.user.id)

    serializer = UserSerializer(queryset, many=True)
    return Response(serializer.data)


@extend_schema(request=UserSerializer, tags=['User'])
@api_view(['PUT'])
def change_profile(request, id=None):
    obj = get_object_or_404(User, id=id)
    serializer = UserSerializer(obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# class CustomTokenObtainPairView(TokenObtainPairView):
#     def post(self, request, *args, **kwargs):
#         response = super().post(request, *args, **kwargs)
#         if response.status_code == 200:
#             data = response.data
#
#             response.set_cookie(
#                 key='access_token',
#                 value=data['access'],
#                 httponly=True,
#                 samesite='None',
#                 secure=True,
#                 max_age=300,
#             )
#
#             response.set_cookie(
#                 key='refresh_token',
#                 value=data['refresh'],
#                 httponly=True,
#                 samesite='None',
#                 secure=True,
#                 max_age=timedelta(days=1).total_seconds(),
#             )
#
#             response["Access-Control-Allow-Credentials"] = "true"
#             response["Access-Control-Allow-Origin"] = "http://localhost:8081"
#
#             return response
#         return response
#
#
# class CustomTokenRefreshView(TokenRefreshView):
#     def post(self, request, *args, **kwargs):
#         refresh_token = request.COOKIES.get('refresh_token')
#         if not refresh_token:
#             return Response({'error': 'Refresh token missing'}, status=400)
#
#         request.data['refresh'] = refresh_token
#
#         response = super().post(request, *args, **kwargs)
#
#         if response.status_code == 200:
#             response.delete_cookie('access_token')
#
#             data = response.data
#
#             response.set_cookie(
#                 key='access_token',
#                 value=data['access'],
#                 httponly=True,
#                 samesite='None',
#                 secure=True,
#                 max_age=60,
#             )
#
#         return response
