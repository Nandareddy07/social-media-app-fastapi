"""
Seed script to populate the database with sample data for testing
"""
import sys
from sqlalchemy.orm import Session
from api.v1.utils.database import SessionLocal, engine, Base
from api.v1.models.user import User, RoleEnum
from api.v1.models.post import Post
from api.v1.services.user import user_service
from api.v1.services.post import post_service
from api.v1.services.activity import activity_service
from api.v1.schemas.user import UserCreate
from api.v1.schemas.post import CreatePostSchema

def seed_database():
    """Create sample users, posts, and activities"""
    print("🌱 Seeding database with sample data...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Create sample users (skip if they already exist)
        print("\n👥 Creating users...")
        users_data = [
            {"username": "alice", "email": "alice@example.com", "password": "password123"},
            {"username": "bob", "email": "bob@example.com", "password": "password123"},
            {"username": "charlie", "email": "charlie@example.com", "password": "password123"},
            {"username": "demo_admin", "email": "demo_admin@example.com", "password": "admin123"},
        ]
        
        created_users = []
        for user_data in users_data:
            # Check if user already exists
            existing = db.query(User).filter(User.email == user_data['email']).first()
            if existing:
                print(f"  ⏭️  User {user_data['username']} already exists, skipping")
                created_users.append(user_data['username'])
                continue
            
            user_create = UserCreate(**user_data)
            user_response = user_service.create_user(user_create, db)
            print(f"  ✓ Created user: {user_data['username']}")
            created_users.append(user_data['username'])
        
        # Fetch actual user objects
        alice = db.query(User).filter(User.username == "alice").first()
        bob = db.query(User).filter(User.username == "bob").first()
        charlie = db.query(User).filter(User.username == "charlie").first()
        admin_user = db.query(User).filter(User.username == "demo_admin").first()
        
        # Set admin role if user exists
        if admin_user and admin_user.role != RoleEnum.admin:
            admin_user.role = RoleEnum.admin
            db.commit()
            print("  ✓ Set admin role for demo_admin user")
        
        # Create follows (only if users exist)
        print("\n🤝 Creating follow relationships...")
        if alice and bob:
            try:
                user_service.follow_user(db, bob.id, alice)
                print(f"  ✓ Alice follows Bob")
            except:
                print(f"  ⏭️  Alice already follows Bob")
        
        if alice and charlie:
            try:
                user_service.follow_user(db, charlie.id, alice)
                print(f"  ✓ Alice follows Charlie")
            except:
                print(f"  ⏭️  Alice already follows Charlie")
        
        if bob and alice:
            try:
                user_service.follow_user(db, alice.id, bob)
                print(f"  ✓ Bob follows Alice")
            except:
                print(f"  ⏭️  Bob already follows Alice")
        
        # Create sample posts (only if users exist)
        print("\n📝 Creating posts...")
        posts_data = []
        
        if alice:
            posts_data.extend([
                {"user": alice, "content": "Hello everyone! Just joined this amazing social network! 🎉"},
                {"user": alice, "content": "Beautiful day for coding! Working on some exciting features."},
            ])
        
        if bob:
            posts_data.extend([
                {"user": bob, "content": "Just finished reading a great book on system design. Highly recommend!"},
                {"user": bob, "content": "Anyone interested in a tech meetup this weekend?"},
            ])
        
        if charlie:
            posts_data.extend([
                {"user": charlie, "content": "Excited to share my latest project with you all! Check it out!"},
                {"user": charlie, "content": "Coffee and code - the perfect combination ☕💻"},
            ])
        
        created_posts = []
        for post_data in posts_data:
            post_schema = CreatePostSchema(content=post_data["content"])
            post = post_service.create(db, post_data["user"], post_schema)
            created_posts.append(post)
            print(f"  ✓ Created post by {post_data['user'].username}")
        
        # Create likes (directly create Like records)
        print("\n❤️  Creating likes...")
        from api.v1.models.post import Like
        
        if alice and bob and len(created_posts) > 0:
            # Alice likes Bob's posts
            for post in created_posts:
                if post['original_post_owner']['username'] == 'bob':
                    like = Like(user_id=alice.id, post_id=post['id'])
                    like.liked = True
                    db.add(like)
                    print(f"  ✓ Alice liked Bob's post")
            
            db.commit()
        
        if bob and len(created_posts) > 0:
            # Bob likes Alice's first post
            like = Like(user_id=bob.id, post_id=created_posts[0]['id'])
            like.liked = True
            db.add(like)
            db.commit()
            print(f"  ✓ Bob liked Alice's post")
        
        if charlie and len(created_posts) >= 3:
            # Charlie likes first 3 posts
            for post in created_posts[:3]:
                like = Like(user_id=charlie.id, post_id=post['id'])
                like.liked = True
                db.add(like)
                print(f"  ✓ Charlie liked a post")
            
            db.commit()
        
        print("\n✅ Database seeded successfully!")
        print(f"\n📊 Summary:")
        print(f"  - Users: {len(created_users)}")
        print(f"  - Posts: {len(created_posts)}")
        
        from api.v1.models.activity import Activity
        print(f"  - Activities: {db.query(Activity).count()}")
        print(f"\n🔑 Login credentials (all passwords: 'password123' or 'admin123'):")
        for username in created_users:
            print(f"  - {username}@example.com")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
