from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.team import TeamCreate, MemberAdd
from schemas.comment import CommentCreate
from services.collaboration_service import CollaborationService
from routes.ws import manager

router = APIRouter()

@router.post("/teams/create")
def create_team(team: TeamCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CollaborationService(db)
    return service.create_team(current_user["user_id"], team.name)

@router.get("/teams/my_team")
def get_my_team(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CollaborationService(db)
    return service.get_my_team(current_user["user_id"])

@router.get("/teams/{team_id}/members")
def get_members(team_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CollaborationService(db)
    return service.get_members(team_id)

@router.post("/teams/{team_id}/add_member")
def add_member(team_id: int, member: MemberAdd, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CollaborationService(db)
    service.add_member(team_id, member.email, member.role)
    return {"message": "Member added to team"}

@router.post("/tasks/{task_id}/comments")
async def add_comment(task_id: int, comment: CommentCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CollaborationService(db)
    new_comment = service.add_comment(task_id, current_user["user_id"], current_user["sub"], comment.content)
    await manager.broadcast({
        "type": "new_comment",
        "task_id": task_id,
        "comment": {
            "id": new_comment.id,
            "username": new_comment.username,
            "content": new_comment.content,
            "created_at": new_comment.created_at.isoformat()
        }
    })
    return new_comment

@router.get("/tasks/{task_id}/comments")
def get_comments(task_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CollaborationService(db)
    return service.get_comments(task_id)
