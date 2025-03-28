import json
import pytest
from django.core.cache import cache

pytestmark = pytest.mark.django_db


class TestPostEndpoints:
    endpoint = '/api/post/'
    endpoint_1 = '/api/post/?by_post_id=1'

    def test_post_get(self, post_factory, api_client):
        post_factory.create_batch(4)
        response = api_client().get(self.endpoint)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 4

    def test_post_get_by_id(self, post_factory, api_client):
        post_factory.create_batch(4)
        response = api_client().get(self.endpoint_1)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 1

    def test_post_create(self, post_factory, api_client, user_factory):
        user_factory(id=1)
        data = {
            "description": "string",
            "author": 1
        }
        response = api_client().post(self.endpoint, data=json.dumps(data), content_type='application/json')
        assert response.status_code == 200

    def test_post_create_bad(self, post_factory, api_client, user_factory):
        data = {
            "description": "string",
            "author": 0
        }
        response = api_client().post(self.endpoint, data=json.dumps(data), content_type='application/json')

        assert response.status_code == 400

    def test_post_delete(self, post_factory, api_client):
        obj = post_factory(id=1)
        end = f'{self.endpoint}{obj.id}/'
        response = api_client().delete(end)
        assert response.status_code == 200


class TestLikeEndpoints:
    endpoint = '/api/like/'
    endpoint_1 = '/api/like/?by_post_id=1'

    def test_like_get(self, like_factory, api_client):
        like_factory.create_batch(4)
        response = api_client().get(self.endpoint)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 4

    def test_like_get_by_id(self, like_factory, api_client):
        like_factory.create_batch(4)
        response = api_client().get(self.endpoint_1)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 1

    def test_like_create(self, like_factory, api_client, user_factory, post_factory):
        user = user_factory(id=1)
        post = post_factory(id=1)
        data = {
            "post": post.id,
            "user": user.id
        }
        response = api_client().post(self.endpoint, data=json.dumps(data), content_type='application/json')
        assert response.status_code == 200

    def test_like_create_bad(self, api_client, like_factory):
        data = {
            "post": 1,
            "user": 1
        }
        response = api_client().post(self.endpoint, data=json.dumps(data), content_type='application/json')

        assert response.status_code == 400

    def test_like_delete(self, like_factory, api_client):
        obj = like_factory(id=1)
        end = f'{self.endpoint}{obj.id}/'
        response = api_client().delete(end)
        assert response.status_code == 200


class TestCommentEndpoints:
    endpoint = '/api/comment/'
    endpoint_1 = '/api/comment/?by_post_id=1'

    def test_comment_get(self, comment_factory, api_client):
        comment_factory.create_batch(4)
        response = api_client().get(self.endpoint)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 4

    def test_comment_get_by_id(self, comment_factory, api_client):
        comment_factory.create_batch(4)
        response = api_client().get(self.endpoint_1)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 1

    def test_comment_create(self, api_client, user_factory, post_factory):
        user = user_factory(id=1)
        post = post_factory(id=1)
        data = {
            "text": "va",
            "post": post.id,
            "user": user.id
        }
        response = api_client().post(self.endpoint, data=json.dumps(data), content_type='application/json')
        assert response.status_code == 200

    def test_comment_create_bad(self, api_client):
        data = {
            "post": 1,
            "author": 1
        }
        response = api_client().post(self.endpoint, data=json.dumps(data), content_type='application/json')

        assert response.status_code == 400

    def test_comment_delete(self, comment_factory, api_client):
        obj = comment_factory(id=1)
        end = f'{self.endpoint}{obj.id}/'
        response = api_client().delete(end)
        assert response.status_code == 200