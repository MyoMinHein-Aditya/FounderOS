from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.team import TeamCreate, MemberAdd
from schemas.comment import CommentCreate
from services.collaboration_service import CollaborationService
from routes.ws import manager

class CollaborationController:
    def __init__(self):
        self.router = APIRouter(prefix="/collaboration", tags=["Collaboration"])
        self.router.add_api_route("/teams/create", self.create_team, methods=["POST"])
        self.router.add_api_route("/teams/my_team", self.get_my_team, methods=["GET"])
        self.router.add_api_route("/teams/{team_id}/members", self.get_members, methods=["GET"])
        self.router.add_api_route("/teams/{team_id}/add_member", self.add_member, methods=["POST"])
        self.router.add_api_route("/tasks/{task_id}/comments", self.add_comment, methods=["POST"])
        self.router.add_api_route("/tasks/{task_id}/comments", self.get_comments, methods=["GET"])

    def _get_service(self, db: Session) -> CollaborationService:
        return CollaborationService(db)

    def create_team(self, team: TeamCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.create_team(current_user["user_id"], team.name)

    def get_my_team(self, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_my_team(current_user["user_id"])

    def get_members(self, team_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_members(team_id)

    def add_member(self, team_id: int, member: MemberAdd, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        service.add_member(team_id, member.email, member.role)
        return {"message": "Member added to team"}

    async def add_comment(self, task_id: int, comment: CommentCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        new_comment = service.add_comment(task_id, current_user["user_id"], current_user.get("sub", ""), comment.content)
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

    def get_comments(self, task_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_comments(task_id)

collaboration_controller = CollaborationController()
router = collaboration_controller.router
