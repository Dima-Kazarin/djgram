import pytest
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError

from mainapp import models

pytestmark = pytest.mark.django_db


class TestPostModel:
    def test_str_method(self, post_factory, user_factory):
        user_obj = user_factory(username='user1')
        obj = post_factory(id=1, author=user_obj)
        assert obj.__str__() == 'user1 - 1'

    def test_description_max_length(self, post_factory):
        description = 'x' * 256
        obj = post_factory(description=description)
        with pytest.raises(ValidationError):
            obj.full_clean()


class TestLikeModel:
    def test_str_method(self, like_factory, post_factory, user_factory):
        user_obj = user_factory(username='user1')
        post_obj = post_factory(id=1)
        obj = like_factory(id=1, post=post_obj, user=user_obj)
        assert obj.__str__() == 'Like 1 by user1'

    def test_unique_combination_post_and_user(self, like_factory, post_factory, user_factory):
        user_obj = user_factory(username='user1')
        post_obj = post_factory(id=1)
        obj = like_factory(id=1, post=post_obj, user=user_obj)
        with pytest.raises(IntegrityError):
            obj1 = like_factory(id=2, post=post_obj, user=user_obj)


class TestCommentModel:
    def test_text_max_length(self, comment_factory):
        text = 'x' * 256
        obj = comment_factory(text=text)
        with pytest.raises(ValidationError):
            obj.full_clean()
