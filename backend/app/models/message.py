from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from ..database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_id = Column(String, ForeignKey("transactions.id", ondelete="CASCADE"), index=True)
    sender_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    claim = relationship("Transaction", backref="messages")
    sender = relationship("User")
