from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from .serializers import PostSerializer, LikeSerializer, CommentSerializer, UserSerializer, ChatSerializer, \
    MessageSerializer, FollowSerializer

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

follow_docs = extend_schema(
    responses=FollowSerializer,
    parameters=[
        OpenApiParameter(
            name='by_followed_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY
        ),
        OpenApiParameter(
            name='by_follower_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY
        )
    ],
    tags=['Follow']
)

count_follow_docs = extend_schema(
    responses=FollowSerializer,
    parameters=[
        OpenApiParameter(
            name='followed_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        )
    ],
    tags=['Follow']
)

count_following_docs = extend_schema(
    responses=FollowSerializer,
    parameters=[
        OpenApiParameter(
            name='follower_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        )
    ],
    tags=['Follow']
)

count_post_docs = extend_schema(
    responses=PostSerializer,
    parameters=[
        OpenApiParameter(
            name='user_id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        )
    ],
    tags=['Post']
)
