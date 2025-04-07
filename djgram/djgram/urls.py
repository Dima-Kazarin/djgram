from django.contrib import admin
from django.urls import path, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

from mainapp import views, consumer

router = DefaultRouter()
router.register(r'api/post', views.PostViewSet, basename='post')
router.register(r'api/like', views.LikeViewSet, basename='like')
router.register(r'api/comment', views.CommentViewSet, basename='comment')
router.register(r'api/chat', views.ChatViewSet, basename='chat')
router.register(r'api/message', views.MessageViewSet, basename='message')
router.register(r'api/follow', views.FollowViewSet, basename='follow')

websocket_urlpatterns = [
    path(r'ws/likes/<int:post_id>', consumer.LikeConsumer.as_asgi()),
    path(r'ws/<int:chat_id>/', consumer.ChatConsumer.as_asgi()),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', views.register_view, name='register'),
    path('api/user/', views.get_username_by_id, name='username_by_id'),
    path('api/count_followers/<int:followed_id>/', views.count_followers, name='count_followers'),
    path('api/count_following/<int:follower_id>/', views.count_following, name='count_following'),
    path('api/count_posts/<int:user_id>/', views.count_posts, name='count_posts'),
    path('api/unsubscribe/<int:follower_id>/<int:followed_id>', views.unsubscribe, name='unsubscribe'),
    path('api/current_user/', views.get_current_user, name='current_user'),
    path('api/member/<int:chat_id>', views.ChatMembershipViewSet.as_view({'post': 'create'}), name='member_chat')

] + router.urls + websocket_urlpatterns

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
