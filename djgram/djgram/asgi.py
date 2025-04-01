import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djgram.settings')

django_application = get_asgi_application()

from . import urls
from mainapp import middleware

application = ProtocolTypeRouter(
    {
        'http': get_asgi_application(),
        'websocket': middleware.JWTAuthMiddleware(URLRouter(urls.websocket_urlpatterns))
    }
)
#