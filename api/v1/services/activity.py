from sqlalchemy.orm import Session
from api.v1.models.activity import Activity, ActionType

class ActivityService:
    def create_activity(self, db: Session, actor_id: str, action_type: ActionType, message: str, target_id: str = None):
        activity = Activity(
            actor_id=actor_id,
            action_type=action_type,
            message=message,
            target_id=target_id
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity

    def get_feed(self, db: Session, limit: int = 50, offset: int = 0):
        return db.query(Activity).order_by(Activity.created_at.desc()).offset(offset).limit(limit).all()

activity_service = ActivityService()
