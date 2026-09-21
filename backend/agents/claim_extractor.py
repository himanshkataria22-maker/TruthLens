"""Agent 1: Extracts factual claims from raw input text or OCR image data."""

from typing import List, Optional
from models import ClaimItem

async def extract_claims(text: Optional[str] = None, image_data: Optional[bytes] = None) -> List[ClaimItem]:
    """
    Placeholder function for extracting atomic factual claims.
    Will be implemented with LLM / Vision models.
    """
    return [
        ClaimItem(
            id="claim-1",
            statement=text or "Sample extracted claim statement",
            confidence=0.95
        )
    ]
