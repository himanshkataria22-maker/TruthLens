/**
 * Client-side input validation utilities for claim text
 */

export const VALIDATION_RULES = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 2000,
  MIN_ALPHA_RATIO: 0.20, // At least 20% alphabetic characters
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate claim text client-side
 * Returns validation status and error message if invalid
 */
export function validateClaimText(text: string): ValidationResult {
  // Check 1: Empty or whitespace only
  if (!text || !text.trim()) {
    return {
      isValid: false,
      error: "Please enter a claim to verify.",
    };
  }

  const stripped = text.trim();

  // Check 2: Too short
  if (stripped.length < VALIDATION_RULES.MIN_LENGTH) {
    return {
      isValid: false,
      error: "Please enter more context — this looks too short to verify.",
    };
  }

  // Check 3: Too long
  if (stripped.length > VALIDATION_RULES.MAX_LENGTH) {
    return {
      isValid: false,
      error: `This message is too long. Please paste a shorter excerpt (max ${VALIDATION_RULES.MAX_LENGTH} characters).`,
    };
  }

  // Check 4: Gibberish detection
  // Count alphabetic characters
  const alphaCount = stripped
    .split("")
    .filter((c) => /[a-zA-Z]/.test(c)).length;
  const totalCount = stripped.length;

  if (totalCount > 0 && alphaCount / totalCount < VALIDATION_RULES.MIN_ALPHA_RATIO) {
    return {
      isValid: false,
      error:
        "This doesn't look like a valid claim. Please paste an actual message or statement.",
    };
  }

  // Check 5: Not mostly gibberish (less than 50% alphabetic + spaces)
  const spaceCount = stripped.split("").filter((c) => /\s/.test(c)).length;
  const meaningfulRatio = (alphaCount + spaceCount) / totalCount;

  if (meaningfulRatio < 0.5) {
    return {
      isValid: false,
      error:
        "This doesn't look like a valid claim. Please paste an actual message or statement.",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Get character count with visual warning threshold
 */
export function getCharacterWarning(count: number): {
  percentage: number;
  level: "normal" | "warning" | "critical";
} {
  const percentage = (count / VALIDATION_RULES.MAX_LENGTH) * 100;

  if (percentage > 95) {
    return { percentage, level: "critical" };
  } else if (percentage > 80) {
    return { percentage, level: "warning" };
  }

  return { percentage, level: "normal" };
}
