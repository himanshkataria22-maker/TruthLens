"""
Input validation utilities for claim text.
Provides validation functions with clear error messages.
"""

import re
from typing import Tuple, Optional

# Validation constants
MIN_CLAIM_LENGTH = 10
MAX_CLAIM_LENGTH = 2000
MIN_ALPHA_RATIO = 0.20  # At least 20% alphabetic characters


class ValidationError(Exception):
    """Custom exception for validation failures."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def validate_claim_text(text: str) -> Tuple[bool, Optional[str]]:
    """
    Comprehensive validation of claim text.
    Returns: (is_valid, error_message)
    
    Validation checks:
    1. Not empty or whitespace-only
    2. Not too short (< 10 chars)
    3. Not too long (> 2000 chars)
    4. Not gibberish (reasonable alphabetic ratio)
    """
    
    # Check 1: Empty or whitespace only
    if not text or not text.strip():
        return False, "Please enter a claim to verify."
    
    # Work with stripped text for length checks
    stripped = text.strip()
    
    # Check 2: Too short
    if len(stripped) < MIN_CLAIM_LENGTH:
        return False, "Please enter more context — this looks too short to verify."
    
    # Check 3: Too long
    if len(stripped) > MAX_CLAIM_LENGTH:
        return False, "This message is too long. Please paste a shorter excerpt (max 2000 characters)."
    
    # Check 4: Gibberish detection
    # Count alphabetic characters and spaces
    alpha_count = sum(1 for c in stripped if c.isalpha())
    space_count = sum(1 for c in stripped if c.isspace())
    total_count = len(stripped)
    
    # Calculate ratio of "meaningful" characters (alphabetic + spaces)
    meaningful_ratio = (alpha_count + space_count) / total_count if total_count > 0 else 0
    
    # If less than 20% alphabetic characters, likely gibberish
    if alpha_count / total_count < MIN_ALPHA_RATIO if total_count > 0 else False:
        return False, "This doesn't look like a valid claim. Please paste an actual message or statement."
    
    # Additional check: if text is mostly numbers/special chars without meaningful words
    # This catches random character strings like "asdfjkl" or "1234567"
    if meaningful_ratio < 0.5:  # Less than 50% alphabetic + spaces
        return False, "This doesn't look like a valid claim. Please paste an actual message or statement."
    
    return True, None


def get_validation_error_message(text: str) -> Optional[str]:
    """
    Get validation error message if text is invalid, None otherwise.
    Convenience function that returns just the error message.
    """
    is_valid, error_msg = validate_claim_text(text)
    return error_msg if not is_valid else None
