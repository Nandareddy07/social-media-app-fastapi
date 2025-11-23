
from fastapi import HTTPException, status, BackgroundTasks
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session, joinedload
from api.v1.models.post import Post, Like, Bookmark
from api.v1.models.post_comment import PostComment
from api.v1.models.user import User
from api.v1.schemas.post import (
    CreatePostSchema,
    UpdatePostSchema,
    LikeResponse,
    RepostResponse,
    RepostCreate,
    PostResponse,
    PostResponseSchema,
    CommentResponseSchema,
    BookmarkResponseSchema
)
from api.v1.schemas.user import UserResponse
from api.v1.services.user import user_service
from api.v1.models.notification import Notification
from api.v1.services.notification import notification_service
from api.v1.services.activity import activity_service
from api.v1.models.activity import ActionType
from api.v1.models.user import RoleEnum

class PostService:
    def get_post(self, db: Session, user: User, post_id: str):
        post = db.query(Post).options(
                joinedload(Post.original_post),
                joinedload(Post.user)
                ).filter(Post.id == post_id).first()

        return jsonable_encoder(PostResponseSchema.model_validate(post))


    def get_feeds(self, db: Session, user: User):
        # Get list of users who blocked current user or are blocked by current user
        blocked_users = [u.id for u in user.blocks]
        blocked_by_users = [u.id for u in user.blocked_by]
        excluded_user_ids = set(blocked_users + blocked_by_users)

        posts = db.query(Post).filter(Post.user_id.notin_(excluded_user_ids)).options(
            joinedload(Post.original_post),
            joinedload(Post.user)
        ).all()

        posts_response = []
        for post in posts:
            validated_post_response = PostResponseSchema.model_validate(post)
            posts_response.append(validated_post_response)

        return jsonable_encoder(posts_response)


    def create(self, db: Session, user: User, schema: CreatePostSchema):
        schema_dict = schema.model_dump()

        if all(value is None for value in schema_dict.values()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide one of content, image or video",
            )

        post = Post(user_id=user.id, **schema_dict)

        db.add(post)
        db.commit()
        db.refresh(post)

        # Log activity
        activity_service.create_activity(
            db=db,
            actor_id=user.id,
            action_type=ActionType.POST,
            message=f"{user.username} created a new post",
            target_id=post.id
        )

        return jsonable_encoder(PostResponse.model_validate(post))


    def delete(self, db: Session, user: User, post_id: str):
        # get post matching post_id
        post = db.query(Post).filter(Post.id == post_id).first()

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
            )

        # Check permissions: Owner, Admin, or Post Author
        if user.role not in [RoleEnum.admin, RoleEnum.owner] and post.user_id != user.id:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to delete this post"
            )

        db.delete(post)
        db.commit()


    def update(self, db: Session, user: User, post_id: str, schema: UpdatePostSchema):
        # get post from db
        post = (
            db.query(Post).filter(Post.id == post_id, Post.user_id == user.id).first()
        )

        schema_dict = schema.model_dump()

        if all(value is None for value in schema_dict.values()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide one of content, image or video",
            )

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
            )

        for attr, value in schema_dict.items():
            if value:
                setattr(post, attr, value)

        db.commit()
        db.refresh(post)

        return jsonable_encoder(PostResponse.model_validate(post))


    def like_post(self, db: Session, user: User, post_id: str, background_task: BackgroundTasks):

        # get the post
        post = (
            db.query(Post).filter(Post.id == post_id).first()
        )

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, details="Page not found"
            )

        # Check if user has already liked the post
        like = (
            db.query(Like)
            .filter(Like.post_id == post_id, Like.user_id == user.id)
            .first()
        )

        if like:
            db.delete(like)
            db.commit()

            # notification for unliking a post
            notification = Notification(user_id=post.user_id, message=f"{user.username} recently unliked your post")

            db.add(notification)
            db.commit()

            background_task.add_task(notification_service.user_event_queues[notification.user_id].put, notification.message)

        else:
            like = Like(user_id=user.id, post_id=post_id)
            like.liked = True
            db.add(like)
            db.commit()

            # add notification for like
            notification = Notification(user_id=post.user_id, message=f"{user.username} recently liked your post")

            db.add(notification)
            db.commit()

            # background task for sse notification
            background_task.add_task(notification_service.user_event_queues[notification.user_id].put, notification.message)
            
            # Log activity
            activity_service.create_activity(
                db=db,
                actor_id=user.id,
                action_type=ActionType.LIKE,
                message=f"{user.username} liked a post",
                target_id=post.id
            )


    def get_likes(self, db: Session, post_id: str, user: User):

        post = (
            db.query(Post).filter(Post.id == post_id, Post.user_id == user.id).first()
        )

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, details="Page not found"
            )

        likes = db.query(Like).filter(Like.post_id == post_id).all()

        likes_response = []

        for like in likes:

            owner_details = user_service.get_user_detail(db=db, user_id=like.user_id)
            response_user = jsonable_encoder(owner_details)
            validate_user = UserResponse(**response_user)

            like_response = jsonable_encoder(like)

            like_response["user"] = validate_user.model_dump()

            likes_response.append(like_response)

        return likes_response


    def add_comment(self, db: Session, user: User, post_id: str, content: str):
        # Verify post exists
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        comment = PostComment(post_id=post_id, user_id=user.id, comment=content)
        db.add(comment)
        db.commit()
        db.refresh(comment)
        # Return serialized comment
        return jsonable_encoder(CommentResponseSchema(
            id=comment.id,
            post_id=post_id,
            user_id=user.id,
            content=content,
            created_at=comment.created_at,
            user=user_service.get_user_detail(db=db, user_id=user.id)
        ))

    def get_comments(self, db: Session, post_id: str):
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        comments = db.query(PostComment).filter(PostComment.post_id == post_id).all()
        response = []
        for c in comments:
            user_detail = user_service.get_user_detail(db=db, user_id=c.user_id)
            response.append(jsonable_encoder(CommentResponseSchema(
                id=c.id,
                post_id=post_id,
                user_id=c.user_id,
                content=c.comment,
                created_at=c.created_at,
                user=user_detail
            )))
        return response

    def toggle_bookmark(self, db: Session, user: User, post_id: str):
        # Verify post exists
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        bookmark = db.query(Bookmark).filter(Bookmark.post_id == post_id, Bookmark.user_id == user.id).first()
        if bookmark:
            db.delete(bookmark)
            db.commit()
            return {"bookmarked": False}
        else:
            new_bm = Bookmark(user_id=user.id, post_id=post_id)
            db.add(new_bm)
            db.commit()
            db.refresh(new_bm)
            return {"bookmarked": True, "bookmark": jsonable_encoder(BookmarkResponseSchema(
                id=new_bm.id,
                post_id=post_id,
                user_id=user.id,
                created_at=new_bm.created_at,
                post=self.get_post(db=db, user=user, post_id=post_id)
            ))}

    def get_bookmarks(self, db: Session, user_id: str):
        bookmarks = db.query(Bookmark).filter(Bookmark.user_id == user_id).all()
        response = []
        for bm in bookmarks:
            post = db.query(Post).filter(Post.id == bm.post_id).first()
            response.append(jsonable_encoder(BookmarkResponseSchema(
                id=bm.id,
                post_id=bm.post_id,
                user_id=user_id,
                created_at=bm.created_at,
                post=self.get_post(db=db, user=user_service.get_user_detail(db=db, user_id=user_id), post_id=bm.post_id)
            )))
        return response

    def repost(self, db: Session, user: User, post_id: str, schema: RepostCreate, background_task: BackgroundTasks):
        original_post = self.get_post(db=db, user=user, post_id=post_id)

        if not original_post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Ceeate new post
        new_post = Post(
            content=schema.content,
            user_id=user.id,
            original_post_id=post_id,
        )

        db.add(new_post)
        db.commit()
        db.refresh(new_post)

        new_post_owner = user_service.get_user_detail(db=db, user_id=user.id)

        # Post serialization
        original_post_response = jsonable_encoder(original_post)

        new_post_response = jsonable_encoder(new_post)
        new_post_response["user"] = jsonable_encoder(new_post_owner)
        new_post_response["post"] = original_post_response

        # repost notification
        notification = Notification(user_id=original_post.user_id, message=f"{user.username} shared your post")
        db.add(notification)
        db.commit()

        # background task for notificatiom
        background_task.add_task(notification_service.user_event_queues[notification.user_id].put, notification.message)
        
        # Log activity
        activity_service.create_activity(
            db=db,
            actor_id=user.id,
            action_type=ActionType.POST,
            message=f"{user.username} shared a post",
            target_id=new_post.id
        )

        return RepostResponse(**new_post_response)


post_service = PostService()
