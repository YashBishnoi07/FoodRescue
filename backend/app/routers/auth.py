from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserLogin, UserUpdate, TokenResponse, UserResponse, FCMTokenUpdate, RefreshTokenRequest
from ..services.auth_service import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, decode_token,
)
from ..middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    if payload.role not in ("donor", "receiver", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        name=payload.name,
        phone=payload.phone,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    result = await db.execute(select(User).where(User.id == data["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return TokenResponse(
        access_token=create_access_token({"sub": user.id}),
        refresh_token=create_refresh_token({"sub": user.id}),
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/update-fcm-token")
async def update_fcm_token(
    payload: FCMTokenUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.fcm_token = payload.fcm_token
    await db.commit()
    return {"message": "FCM token updated"}


@router.get("/me/stats")
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import func
    from ..models.listing import FoodListing
    from ..models.transaction import Transaction
    
    stats = {
        "co2_saved_kg": 0.0,
        "food_rescued_kg": 0.0,
        "active_engagements": 0,
        "completed_engagements": 0
    }
    
    if current_user.role == 'donor':
        # Calculate for donor
        active = (await db.execute(select(func.count(FoodListing.id)).where(FoodListing.donor_id == current_user.id, FoodListing.status == 'available'))).scalar()
        completed = (await db.execute(select(func.count(FoodListing.id)).where(FoodListing.donor_id == current_user.id, FoodListing.status.in_(['claimed', 'completed'])))).scalar()
        
        kg_saved = (await db.execute(select(func.sum(FoodListing.quantity)).where(
            FoodListing.donor_id == current_user.id,
            FoodListing.status.in_(['claimed', 'completed']),
            FoodListing.quantity_unit == 'kg'
        ))).scalar() or 0
        
        stats["active_engagements"] = active
        stats["completed_engagements"] = completed
        stats["food_rescued_kg"] = round(float(kg_saved), 2)
        stats["co2_saved_kg"] = round(float(kg_saved) * 2.5, 2)
        
    elif current_user.role == 'receiver':
        # Calculate for receiver
        active = (await db.execute(select(func.count(Transaction.id)).where(Transaction.receiver_id == current_user.id, Transaction.status == 'pending'))).scalar()
        completed = (await db.execute(select(func.count(Transaction.id)).where(Transaction.receiver_id == current_user.id, Transaction.status == 'completed'))).scalar()
        
        # Need to join with FoodListing to get quantity
        result = await db.execute(select(func.sum(FoodListing.quantity)).join(Transaction, FoodListing.id == Transaction.listing_id).where(
            Transaction.receiver_id == current_user.id,
            Transaction.status.in_(['completed', 'confirmed', 'pending']),
            FoodListing.quantity_unit == 'kg'
        ))
        kg_saved = result.scalar() or 0
        
        stats["active_engagements"] = active
        stats["completed_engagements"] = completed
        stats["food_rescued_kg"] = round(float(kg_saved), 2)
        stats["co2_saved_kg"] = round(float(kg_saved) * 2.5, 2)
        
    return stats

@router.get("/users/{user_id}/reputation")
async def get_user_reputation(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import func
    from ..models.transaction import Transaction
    
    # Calculate average rating where user_id is the receiver
    result = await db.execute(
        select(func.avg(Transaction.feedback_rating), func.count(Transaction.id))
        .where(Transaction.receiver_id == user_id, Transaction.feedback_rating.isnot(None))
    )
    avg_rating, total_ratings = result.one()
    
    return {
        "average_rating": round(float(avg_rating), 1) if avg_rating else 0.0,
        "total_ratings": total_ratings or 0
    }
