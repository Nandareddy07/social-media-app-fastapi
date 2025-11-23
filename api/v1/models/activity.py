from enum import Enum
from sqlalchemy import Column, String, ForeignKey, Enum as SQLAlchemyEnum
from api.v1.models.abstract_base import AbstractBaseModel

class ActionType(str, Enum):
    POST = "POST"
    LIKE = "LIKE"
    FOLLOW = "FOLLOW"
    COMMENT = "COMMENT"

class Activity(AbstractBaseModel):
    __tablename__ = "activity"

    actor_id = Column(String, ForeignKey("user.id"), nullable=False)
    action_type = Column(SQLAlchemyEnum(ActionType), nullable=False)
    target_id = Column(String, nullable=True) # ID of the post, user, etc.
    message = Column(String, nullable=False)
