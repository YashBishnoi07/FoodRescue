from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from ..database import get_db
from ..models.notification import Notification
from ..schemas.transaction import NotificationResponse
from ..middleware.auth_middleware import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/", response_model=list[NotificationResponse])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    return [NotificationResponse.model_validate(n) for n in result.scalars().all()]


@router.post("/mark-read")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.read == False)
        .values(read=True)
    )
    await db.commit()
    return {"message": "All notifications marked as read"}


@router.post("/{notif_id}/read")
async def mark_one_read(
    notif_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Notification).where(Notification.id == notif_id))
    notif = result.scalar_one_or_none()
    if notif and notif.user_id == current_user.id:
        notif.read = True
        await db.commit()
    return {"message": "Marked as read"}


from fastapi import WebSocket, WebSocketDisconnect
from ..websocket_manager import manager
from ..services.auth_service import decode_token

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=1008)
            return
    except Exception:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
