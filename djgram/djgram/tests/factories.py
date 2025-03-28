import factory

from mainapp.models import User, Like, Post, Comment


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: 'test_username_%d' % n)
    password = factory.Sequence(lambda n: 'test_password_%d' % n)


class PostFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Post

    description = factory.Sequence(lambda n: 'test_description_%d' % n)
    author = factory.SubFactory(UserFactory)


class LikeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Like

    post = factory.SubFactory(PostFactory)
    user = factory.SubFactory(UserFactory)


class CommentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Comment

    text = factory.Sequence(lambda n: 'test_text_%d' % n)
    post = factory.SubFactory(PostFactory)
    user = factory.SubFactory(UserFactory)
