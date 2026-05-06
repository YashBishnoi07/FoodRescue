from sqlalchemy.ext.asyncio import AsyncSession
from ..models.notification import Notification
from ..websocket_manager import manager

async def create_notification(
    db: AsyncSession,
    user_id: str,
    title: str,
    message: str,
    notif_type: str = "info",
):
    """Persist an in-app notification and push via WebSocket."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    
    # Push real-time notification
    await manager.send_personal_message({
        "id": notif.id,
        "title": notif.title,
        "message": notif.message,
        "type": notif.type,
        "created_at": notif.created_at.isoformat()
    }, user_id)
    
    return notif
