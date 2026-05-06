from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database import get_db
from ..models.user import User
from ..models.transaction import Transaction
from ..models.message import Message
from ..schemas.message import MessageCreate, MessageResponse
from ..middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/messages", tags=["Messages"])

@router.get("/{claim_id}", response_model=List[MessageResponse])
async def get_messages(
    claim_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify the user is part of the claim (donor or receiver)
    result = await db.execute(select(Transaction).where(Transaction.id == claim_id))
    claim = result.scalar_one_or_none()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    # User must be the receiver or the donor of the listing
    if current_user.id != claim.receiver_id and current_user.id != claim.donor_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to view these messages")

    # Fetch messages
    result = await db.execute(
        select(Message).where(Message.claim_id == claim_id).order_by(Message.created_at)
    )
    return result.scalars().all()

from ..services.notification_service import create_notification

@router.post("/{claim_id}", response_model=MessageResponse, status_code=201)
async def send_message(
    claim_id: str,
    payload: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Transaction).where(Transaction.id == claim_id))
    claim = result.scalar_one_or_none()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    if current_user.id != claim.receiver_id and current_user.id != claim.donor_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to send messages here")

    new_msg = Message(
        claim_id=claim_id,
        sender_id=current_user.id,
        content=payload.content
    )
    db.add(new_msg)
    await db.commit()
    await db.refresh(new_msg)
    
    # Send push notification to the OTHER person
    other_user_id = claim.donor_id if current_user.id == claim.receiver_id else claim.receiver_id
    await create_notification(
        db,
        user_id=other_user_id,
        title="New Message",
        message=f"{current_user.name} sent you a message: {payload.content[:30]}...",
        notif_type="info"
    )
    
    return new_msg
