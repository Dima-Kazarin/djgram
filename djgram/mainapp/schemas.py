from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from .serializers import PostSerializer, LikeSerializer, CommentSerializer, UserSerializer, ChatSerializer, \
    MessageSerializer

post_docs = extend_schema(
    responses=PostSerializer,
    parameters=[
        OpenApiParameter(
            name='by_post_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY
        ),
        OpenApiParameter(
            name='by_user_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY
        )
    ],
    tags=['Post']
)

like_docs = extend_schema(
    responses=LikeSerializer,
    parameters=[
        OpenApiParameter(
            name='by_post_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY
        ),
        OpenApiParameter(
            name='by_user_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY
        )
    ],
    tags=['Like']
)

comment_docs = extend_schema(
    responses=CommentSerializer,
    parameters=[
        OpenApiParameter(
            name='by_post_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY
        )
    ],
    tags=['Comment']
)

user_docs = extend_schema(
    responses=UserSerializer,
    parameters=[
        OpenApiParameter(
            name='by_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY
        )
    ],
    tags=['User']
)

chat_docs = extend_schema(
    responses=ChatSerializer,
    parameters=[
        OpenApiParameter(
            name='by_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY
        ),
        OpenApiParameter(
            name='by_member_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY
        ),
    ],
    tags=['Messages']
)

member_docs = extend_schema(
    request=None,
    parameters=[
        OpenApiParameter(
            name='chat_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
    ],
    tags=['Messages']
)

message_docs = extend_schema(
    responses=MessageSerializer,
    parameters=[
        OpenApiParameter(
            name='by_chat_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY
        )
    ],
    tags=['Messages']
)
