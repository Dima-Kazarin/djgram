from datetime import timedelta
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.viewsets import ViewSet
from django.core.cache import cache
from django.db import connection

from .models import User, Like, Post, Comment
from .serializers import CommentSerializer, LikeSerializer, PostSerializer, UserSerializer, RegisterSerializer
from .schemas import post_docs, like_docs, comment_docs, user_docs


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


@user_docs
@api_view(['GET'])
def get_username_by_id(request):
    queryset = User.objects.all()

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


@api_view(['GET'])
def get_current_user(request):
    queryset = User.objects.filter(id=request.user.id)

    serializer = UserSerializer(queryset, many=True)
    return Response(serializer.data)


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
