"""Verdict-aware fallback explanations for when LLM calls fail."""

def get_verdict_aware_explanation(verdict: str) -> dict:
    """Return a verdict-aware fallback explanation in all 5 languages.
    
    Args:
        verdict: One of SUPPORTED, FALSE, MISLEADING, UNVERIFIABLE
    
    Returns:
        Dict with keys: en, hi, mr, ta, bn
    """
    explanations = {
        "SUPPORTED": {
            "en": "This claim is supported by the evidence reviewed. See the sources below for details.",
            "hi": "यह दावा समीक्षित साक्ष्य द्वारा समर्थित है। विवरण के लिए नीचे दिए गए स्रोत देखें।",
            "mr": "हा दावा समीक्षित साक्ष्य द्वारे समर्थित आहे. तपशीलांसाठी खाली दिलेले स्रोत पहा.",
            "ta": "இந்தக் கூற्று மதிப्பாய்வு செய்யப்பட்ட ஆதாரங்களால் ஆதரிக்கப்படுகிறது. விவரங்களுக்கு கீழே உள்ள மூலங்களைப் பார்க்கவும்.",
            "bn": "এই দাবিটি পর্যালোচনা করা প্রমাণ দ্বারা সমর্থিত। বিস্তারিত জানার জন্য নীচে দেওয়া উৎসগুলি দেখুন।",
        },
        "FALSE": {
            "en": "This claim is contradicted by the evidence. The sources below provide details.",
            "hi": "यह दावा साक्ष्य द्वारा विरोधित है। नीचे दिए गए स्रोत विवरण प्रदान करते हैं।",
            "mr": "हा दावा साक्ष्य द्वारे विरोधित आहे. खाली दिलेले स्रोत तपशील प्रदान करतात.",
            "ta": "இந்தக் கூற்று ஆதாரங்களால் மறுக்கப்படுகிறது. கீழே உள்ள மூலங்கள் விவரங்களை வழங்குகின்றன.",
            "bn": "এই দাবিটি প্রমাণ দ্বারা বিরোধিত। নীচে দেওয়া উৎসগুলি বিস्तারिত প्রদান করে।",
        },
        "MISLEADING": {
            "en": "This claim is partially true but missing important context. See the sources below for details.",
            "hi": "यह दावा आंशिक रूप से सत्य है लेकिन महत्वपूर्ण संदर्भ गायब है। विवरण के लिए नीचे दिए गए स्रोत देखें।",
            "mr": "हा दावा अंशतः खरा आहे परंतु महत्वपूर्ण संदर्भ गायब आहे. विवरणासाठी खाली दिलेले स्रोत पहा.",
            "ta": "இந்தக் கூற்று பகுதியளவு உண்மை ஆனால் முக्கிய संदर्भ இல்லை. விவரங்களுக்கு கீழே உள்ள மூலங்களைப் பார்க்கவும்.",
            "bn": "এই দাবিটি আংশিকভাবে সত्य কিন্তু গুরুত্বपূर्ण संदर्भ অনুপস্থিত। বিস্तারিত জানার জন्য नीचे देওয়া उत्सগुलि देखुন।",
        },
        "UNVERIFIABLE": {
            "en": "There wasn't enough credible evidence to reach a firm conclusion on this claim.",
            "hi": "इस दावे पर एक दृढ़ निष्कर्ष तक पहुंचने के लिए पर्याप्त विश्वसनीय साक्ष्य नहीं थे।",
            "mr": "या दाव्यावर दृढ निष्कर्ष तक पोहोचण्यासाठी पर्याप्त विश्वासार्ह साक्ष्य नव्हते.",
            "ta": "இந்தக் கூற்றில் உறுதியான निष्कर्ஷுக்கு போதுமான நம்பகமான ஆதாரங்கள் இல்லை.",
            "bn": "এই দাবিতে একটি দৃঢ় সিদ্ধান্তে পৌঁছানোর জন्য পর্যাপ্ত বিশ্বাসযোগ্য প্রমাণ ছিল না।",
        }
    }
    
    return explanations.get(verdict, explanations["UNVERIFIABLE"])


def log_verdict_mismatch(verdict: str, explanation: str, claim: str) -> None:
    """Log a warning if explanation text contradicts the verdict (quality check)."""
    lower_exp = explanation.lower()
    verdict_upper = verdict.upper()
    
    # Phrases that indicate UNVERIFIABLE/failure
    unverifiable_phrases = [
        "could not be verified",
        "contradictory, limited",
        "reviewed against available",
        "could not find enough sources",
        "insufficient evidence",
    ]
    
    # Check for mismatch
    has_unverifiable_text = any(phrase in lower_exp for phrase in unverifiable_phrases)
    
    if has_unverifiable_text and verdict != "UNVERIFIABLE":
        print(f"[TruthLens ERROR] [QualityCheck] VERDICT-EXPLANATION MISMATCH!")
        print(f"  Verdict: {verdict}")
        print(f"  Claim: {claim[:80]}...")
        print(f"  Explanation contains UNVERIFIABLE text but verdict is: {verdict}")
        print(f"  This indicates the fallback explanation was used incorrectly.")
