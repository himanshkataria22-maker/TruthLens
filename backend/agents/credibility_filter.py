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

def _get_domain_tier(domain: str) -> int:
    domain = domain.lower()
    for t1 in TIER_1_DOMAINS:
        if domain == t1 or domain.endswith("." + t1):
            return 1
    if domain.endswith(".gov.in") or domain.endswith(".nic.in") or domain.endswith(".mil.in"):
        return 1

    for t2 in TIER_2_DOMAINS:
        if domain == t2 or domain.endswith("." + t2):
            return 2

    return 3

def filter_sources(sources: List[RawSearchResult]) -> List[CredibleSource]:
    try:
        tier_1_items: List[CredibleSource] = []
        tier_2_items: List[CredibleSource] = []
        tier_3_items: List[CredibleSource] = []

        for src in sources:
            tier = _get_domain_tier(getattr(src, 'domain', ''))
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
