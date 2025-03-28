import pytest
import redis

from pytest_factoryboy import register
from rest_framework.test import APIClient

from .factories import PostFactory, UserFactory, LikeFactory, CommentFactory

register(PostFactory)
register(UserFactory)
register(CommentFactory)
register(LikeFactory)


@pytest.fixture
def api_client():
    return APIClient


@pytest.fixture(autouse=True)
def enable_db_access(db):
    pass


@pytest.fixture
def redis_connection():
    return redis.StrictRedis(host='redis', port=6379, db=1)
