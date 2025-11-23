from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from api.v1.utils.dependencies import get_db
from api.v1.services.activity import activity_service
from api.v1.responses.success_response import success_response

activity = APIRouter(prefix="/activity", tags=["activity"])

@activity.get("/feed", status_code=status.HTTP_200_OK)
async def get_activity_feed(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    activities = activity_service.get_feed(db, limit, offset)
    return success_response(
        status_code=status.HTTP_200_OK,
        message="Activity feed retrieved successfully",
        data=activities
    )
