import re
from typing import List
from models import RawSearchResult, CredibleSource

TIER_1_DOMAINS = {
    "gov.in", "nic.in", "who.int", "rbi.org.in", "pib.gov.in",
    "mohfw.gov.in", "isro.gov.in", "mea.gov.in", "eci.gov.in",
    "uidai.gov.in", "cbic.gov.in", "incometax.gov.in", "cdc.gov",
    "un.org", "unicef.org", "icmr.gov.in", "upsc.gov.in", "supremecourtofindia.nic.in"
}

TIER_2_DOMAINS = {
    "boomlive.in", "altnews.in", "factcheck.org", "vishvasnews.com",
    "newschecker.in", "snopes.com", "politifact.com", "thip.media",
    "factly.in", "newsmobile.in", "thequint.com",
    "thehindu.com", "indianexpress.com", "ptinews.com", "bbc.com",
    "bbc.co.uk", "reuters.com", "ndtv.com", "timesofindia.indiatimes.com",
    "hindustantimes.com", "indiatoday.in", "economictimes.indiatimes.com",
    "livemint.com", "deccanherald.com", "thewire.in", "aninews.in",
    "apnews.com", "theprint.in", "scroll.in", "firstpost.com"
}

# Tier 2.5: Encyclopedic, historical, and academic sources (for general knowledge/historical claims)
TIER_2_5_DOMAINS = {
    "wikipedia.org", "britannica.com", "historyonline.com",
    "britannicaonline.com", "encyclopedia.com", "oxfordbibliographies.com",
    "jstor.org", "edu",  # Generic .edu domain (checked via suffix)
}

# Domain suffixes for educational institutions
EDU_SUFFIXES = {".edu", ".ac.uk", ".ac.in"}

def _get_domain_tier(domain: str, claim_type: str = "general") -> int:
    """
    Get domain tier with support for claim type.
    claim_type: "historical", "scientific", "general", "current" (default: general)
    - historical/scientific: Accept encyclopedic & academic sources as Tier 2
    - current: Stricter — only news/fact-check for Tier 2
    - general: Default — balanced approach
    """
    domain = domain.lower()
    
    # Tier 1: Always trusted (government, official orgs)
    for t1 in TIER_1_DOMAINS:
        if domain == t1 or domain.endswith("." + t1):
            return 1
    if domain.endswith(".gov.in") or domain.endswith(".nic.in") or domain.endswith(".mil.in"):
        return 1

    # Tier 2: News/fact-checkers (always)
    for t2 in TIER_2_DOMAINS:
        if domain == t2 or domain.endswith("." + t2):
            return 2

    # Tier 2.5: Encyclopedic/academic (only for historical/scientific/general claims)
    if claim_type in ("historical", "scientific", "general"):
        # Check exact domain matches
        for t25 in TIER_2_5_DOMAINS:
            if t25 != "edu" and (domain == t25 or domain.endswith("." + t25)):
                return 2  # Treat as Tier 2 for broader source inclusion
        
        # Check .edu suffix
        for suffix in EDU_SUFFIXES:
            if domain.endswith(suffix):
                return 2

    return 3

def filter_sources(sources: List[RawSearchResult], claim_type: str = "general") -> List[CredibleSource]:
    """
    Filter sources by credibility tier.
    claim_type: "historical", "scientific", "general", "current"
    """
    try:
        tier_1_items: List[CredibleSource] = []
        tier_2_items: List[CredibleSource] = []
        tier_3_items: List[CredibleSource] = []

        for src in sources:
            tier = _get_domain_tier(getattr(src, 'domain', ''), claim_type=claim_type)
            item = CredibleSource(
                title=getattr(src, 'title', ''),
                url=getattr(src, 'url', ''),
                snippet=getattr(src, 'snippet', ''),
                domain=getattr(src, 'domain', ''),
                tier=tier,
                confidence_label="high confidence" if tier in (1, 2) else "low confidence"
            )
            if tier == 1:
                tier_1_items.append(item)
            elif tier == 2:
                tier_2_items.append(item)
            else:
                tier_3_items.append(item)

        ranked: List[CredibleSource] = tier_1_items + tier_2_items

        if len(ranked) < 3:
            needed = 3 - len(ranked)
            for t3 in tier_3_items[:needed]:
                t3.confidence_label = "low confidence"
                ranked.append(t3)

        return ranked
    except Exception as e:
        print(f"[TruthLens ERROR] [CredibilityFilterAgent] Error filtering sources: {e}")
        return []
