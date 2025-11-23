import sys
import os
try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from api.v1.utils.database import Base
    from api.v1.models.user import User, RoleEnum
    from api.v1.models.post import Post
    from api.v1.models.block import Block
    from api.v1.models.activity import Activity, ActionType
    from api.v1.services.user import user_service
    from api.v1.services.post import post_service
    from api.v1.services.activity import activity_service
    from api.v1.schemas.user import UserCreate, UserLogin
    from api.v1.schemas.post import CreatePostSchema
except Exception as e:
    import traceback
    traceback.print_exc()
    raise e

# Setup in-memory SQLite DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_backend():
    # Mock password hashing to avoid bcrypt issues
    user_service.hash_password = lambda p: f"hashed_{p}"
    user_service.verify_password = lambda p, h: h == f"hashed_{p}"

    try:
        init_db()
        db = SessionLocal()
        
        print("--- Testing Backend Features ---")

        # 1. Create Users
        print("\n1. Creating Users...")
        owner_data = UserCreate(username="owner", email="owner@example.com", password="password")
        admin_data = UserCreate(username="admin", email="admin@example.com", password="password")
        user_a_data = UserCreate(username="user_a", email="a@example.com", password="password")
        user_b_data = UserCreate(username="user_b", email="b@example.com", password="password")

        owner_res = user_service.create_user(owner_data, db)
        admin_res = user_service.create_user(admin_data, db)
        user_a_res = user_service.create_user(user_a_data, db)
        user_b_res = user_service.create_user(user_b_data, db)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise e

    # Fetch user objects
    owner = db.query(User).filter(User.email == "owner@example.com").first()
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    user_a = db.query(User).filter(User.email == "a@example.com").first()
    user_b = db.query(User).filter(User.email == "b@example.com").first()

    # Manually set roles (since create_user defaults to user)
    owner.role = RoleEnum.owner
    admin.role = RoleEnum.admin
    db.commit()

    print("Users created: Owner, Admin, User A, User B")

    # 2. Activity Logging (Post Creation)
    print("\n2. Testing Activity Logging...")
    post_schema = CreatePostSchema(content="Hello from User A")
    post_service.create(db, user_a, post_schema)
    
    activities = activity_service.get_feed(db)
    assert len(activities) > 0
    assert activities[0].action_type == ActionType.POST
    print("Activity logged successfully.")

    # 3. Blocking Logic
    print("\n3. Testing Blocking Logic...")
    # User A blocks User B
    user_service.block_user(db, user_b.id, user_a)
    print("User A blocked User B.")

    # User B creates a post
    post_b_schema = CreatePostSchema(content="Hello from User B")
    post_service.create(db, user_b, post_b_schema)

    # User A should NOT see User B's post
    feed_a = post_service.get_feeds(db, user_a)
    b_posts_in_feed = [p for p in feed_a if p['original_post_owner']['id'] == str(user_b.id)]
    assert len(b_posts_in_feed) == 0
    print("User A cannot see User B's posts (Success).")

    # User B should NOT see User A's post (Mutual hiding usually, but let's check implementation)
    # Implementation: excluded_user_ids = set(blocked_users + blocked_by_users)
    # So User B should not see User A's posts either.
    feed_b = post_service.get_feeds(db, user_b)
    a_posts_in_feed = [p for p in feed_b if p['original_post_owner']['id'] == str(user_a.id)]
    assert len(a_posts_in_feed) == 0
    print("User B cannot see User A's posts (Success).")

    # 4. Role-Based Deletion
    print("\n4. Testing Role-Based Deletion...")
    # Admin deletes User A's post
    post_a = db.query(Post).filter(Post.user_id == user_a.id).first()
    post_service.delete(db, admin, post_a.id)
    
    deleted_post = db.query(Post).filter(Post.id == post_a.id).first()
    assert deleted_post is None
    print("Admin deleted User A's post (Success).")

    print("\nAll backend tests passed!")

if __name__ == "__main__":
    test_backend()
