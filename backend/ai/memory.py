from models.ai_message import AIMessage

def save_message(db, user_id, role, content):
    message = AIMessage(user_id = user_id, role = role, content = content)
    db.add(message)
    db.commit()

def get_history(db,user_id):
    messages = (db.query(AIMessage).filter(AIMessage.user_id==user_id).order_by(AIMessage.created_at).all())
    return [{"role":m.role, "content":m.content} for m in messages]