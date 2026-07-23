from sqlalchemy.orm import Session
from models.team import Team
from models.team_member import TeamMember
from models.comment import Comment
from models.users import User
from services.notification_service import NotificationService
from fastapi import HTTPException

class CollaborationService:
    def __init__(self, db: Session):
        self.db = db

    def create_team(self, user_id: int, name: str) -> Team:
        existing_member = self.db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
        if existing_member:
            raise HTTPException(status_code=400, detail="You are already in a team.")
        
        team = Team(name=name, owner_id=user_id)
        self.db.add(team)
        self.db.commit()
        self.db.refresh(team)

        member = TeamMember(team_id=team.id, user_id=user_id, role="Admin")
        self.db.add(member)
        self.db.commit()
        return team

    def get_my_team(self, user_id: int) -> dict:
        member = self.db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
        if not member:
            return None
        team = self.db.query(Team).filter(Team.id == member.team_id).first()
        return {"id": team.id, "name": team.name, "role": member.role}

    def get_members(self, team_id: int) -> list:
        members = self.db.query(TeamMember).filter(TeamMember.team_id == team_id).all()
        result = []
        for m in members:
            user = self.db.query(User).filter(User.id == m.user_id).first()
            if user:
                result.append({"id": m.id, "name": user.name, "email": user.email, "role": m.role})
        return result

    def add_member(self, team_id: int, email: str, role: str) -> bool:
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        existing = self.db.query(TeamMember).filter(TeamMember.user_id == user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="User is already member of a team.")

        member = TeamMember(team_id=team_id, user_id=user.id, role=role)
        self.db.add(member)
        self.db.commit()

        notif_service = NotificationService(self.db)
        notif_service.push(user.id, f"You have been added to team.", "/team")
        return True

    def add_comment(self, task_id: int, user_id: int, username: str, content: str) -> Comment:
        comment = Comment(task_id=task_id, user_id=user_id, username=username, content=content)
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def get_comments(self, task_id: int) -> list:
        return self.db.query(Comment).filter(Comment.task_id == task_id).order_by(Comment.id.asc()).all()
