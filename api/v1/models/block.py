from sqlalchemy import Column, ForeignKey, String, Table, UniqueConstraint
from api.v1.models.abstract_base import AbstractBaseModel
from api.v1.utils.database import Base

class Block(AbstractBaseModel):
    __tablename__ = "block"

    blocker_id = Column(String, ForeignKey("user.id"), nullable=False)
    blocked_id = Column(String, ForeignKey("user.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("blocker_id", "blocked_id", name="unique_block"),
    )
