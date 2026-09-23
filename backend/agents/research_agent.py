import os
import urllib.parse
from typing import List
import httpx
from models import RawSearchResult
from dotenv import load_dotenv

load_dotenv()

def _extract_domain(url: str) -> str:
    try:
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except Exception:
        return "unknown"

async def _search_serpapi(query: str, api_key: str) -> List[RawSearchResult]:
    """Search using SerpAPI with DuckDuckGo engine."""
    url = "https://serpapi.com/search"
    params = {
        "api_key": api_key,
        "q": query,
        "engine": "duckduckgo",
        "num": 5
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.get(url, params=params)
        res.raise_for_status()
        data = res.json()
        results = []
        for item in data.get("organic_results", []):
            u = item.get("link", "")
            results.append(RawSearchResult(
                title=item.get("title", ""),
                url=u,
                snippet=item.get("snippet", ""),
                domain=_extract_domain(u)
            ))
        return results

async def _search_tavily(query: str, api_key: str) -> List[RawSearchResult]:
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "basic",
        "max_results": 5
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(url, json=payload)
        res.raise_for_status()
        data = res.json()
        results = []
        for item in data.get("results", []):
            u = item.get("url", "")
            results.append(RawSearchResult(
                title=item.get("title", ""),
                url=u,
                snippet=item.get("content", "") or item.get("snippet", ""),
                domain=_extract_domain(u)
            ))
        return results

async def _search_serper(query: str, api_key: str) -> List[RawSearchResult]:
    url = "https://google.serper.dev/search"
    headers = {"X-API-KEY": api_key, "Content-Type": "application/json"}
    payload = {"q": query, "num": 5}
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(url, headers=headers, json=payload)
        res.raise_for_status()
        data = res.json()
        results = []
        for item in data.get("organic", []):
            u = item.get("link", "")
            results.append(RawSearchResult(
                title=item.get("title", ""),
                url=u,
                snippet=item.get("snippet", ""),
                domain=_extract_domain(u)
            ))
        return results

async def _search_duckduckgo_fallback(query: str) -> List[RawSearchResult]:
    url = "https://html.duckduckgo.com/html/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    data = {"q": query}
    results = []
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(url, data=data, headers=headers)
            if res.status_code == 200:
                import re
                links = re.findall(r'<a class="result__url" href="([^"]+)".*?>(.*?)</a>', res.text)
                snippets = re.findall(r'<a class="result__snippet".*?>(.*?)</a>', res.text)
                titles = re.findall(r'<a class="result__title".*?>(.*?)</a>', res.text)
                
                for idx, match in enumerate(links[:5]):
                    raw_link = match[0]
                    if "uddg=" in raw_link:
                        target = urllib.parse.unquote(raw_link.split("uddg=")[1].split("&")[0])
                    else:
                        target = raw_link
                    
                    title = re.sub('<[^<]+?>', '', titles[idx]) if idx < len(titles) else match[1]
                    snippet = re.sub('<[^<]+?>', '', snippets[idx]) if idx < len(snippets) else "Search result snippet"
                    
                    results.append(RawSearchResult(
                        title=title.strip(),
                        url=target.strip(),
                        snippet=snippet.strip(),
                        domain=_extract_domain(target)
                    ))
    except Exception:
        pass

    # If web search engine did not return items (e.g. rate limit in offline dev), generate knowledge-grounded results for test queries
    if not results:
        results = _generate_grounded_fallback_sources(query)

    return results

def _generate_grounded_fallback_sources(query: str) -> List[RawSearchResult]:
    """
    Generate fallback sources ONLY when web search fails.
    These are intentionally minimal - they don't include specific URLs
    because those can't be verified. We return empty list to force
    the pipeline to handle "no sources found" gracefully instead of
    showing broken 404 links.
    """
    lq = query.lower()
    
    # Return empty - better to show "no sources" than broken 404 links
    # Real web search APIs should be used whenever possible
    print(f"[TruthLens INFO] No fallback sources generated for query: {lq}")
    print("[TruthLens INFO] To avoid 404 errors, ensure a valid web search API is configured:")
    print("  - SEARCH_API_KEY for Serper or Tavily")
    print("  - Otherwise DuckDuckGo fallback will be used")
    
    return []

async def research_queries(queries: List[str]) -> List[RawSearchResult]:
    search_api_key = os.getenv("SEARCH_API_KEY", "").strip()
    all_results: List[RawSearchResult] = []
    seen_urls = set()

    for q in queries:
        query_results: List[RawSearchResult] = []
        try:
            if search_api_key and not search_api_key.startswith("your_"):
                try:
                    # Try SerpAPI first (supports multiple engines including DuckDuckGo)
                    print(f"[TruthLens INFO] [ResearchAgent] Trying SerpAPI for query: {q[:50]}...")
                    query_results = await _search_serpapi(q, search_api_key)
                except Exception as serp_err:
                    print(f"[TruthLens ERROR] [ResearchAgent] SerpAPI failed: {serp_err}. Trying Serper...")
                    try:
                        # Try Serper as backup
                        if len(search_api_key) == 40 and not search_api_key.startswith("tvly"):
                            query_results = await _search_serper(q, search_api_key)
                        else:
                            query_results = await _search_tavily(q, search_api_key)
                    except Exception as api_err:
                        print(f"[TruthLens ERROR] [ResearchAgent] API search failed: {api_err}. Trying DuckDuckGo fallback.")
                        query_results = await _search_duckduckgo_fallback(q)
            else:
                print(f"[TruthLens INFO] [ResearchAgent] No API key configured. Using DuckDuckGo fallback for query: {q}")
                query_results = await _search_duckduckgo_fallback(q)
        except Exception as err:
            print(f"[TruthLens ERROR] [ResearchAgent] Exception while querying '{q}': {err}")
            query_results = _generate_grounded_fallback_sources(q)

        # Log results
        if query_results:
            print(f"[TruthLens INFO] [ResearchAgent] Found {len(query_results)} sources for query: {q[:50]}...")
        else:
            print(f"[TruthLens WARNING] [ResearchAgent] No sources found for query: {q}")

        for res in query_results:
            normalized_url = res.url.split("#")[0].rstrip("/")
            if normalized_url and normalized_url not in seen_urls:
                seen_urls.add(normalized_url)
                all_results.append(res)

    return all_results
