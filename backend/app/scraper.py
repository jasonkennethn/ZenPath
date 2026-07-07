import os
import re
import json
from typing import List, Dict, Any, Optional
import httpx
import google.generativeai as genai
from dotenv import load_dotenv

# Load dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def clean_html(html: str) -> str:
    """
    Strips script, style, and HTML tags from a string to clean it up for the LLM.
    """
    # Remove script and style elements
    text = re.sub(r'<script.*?>.*?</script>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style.*?>.*?</style>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

async def fetch_url_content(url: str) -> str:
    """
    Fetches the content of a URL with realistic headers.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        return clean_html(response.text)

def query_gemini_for_jobs(content: str, is_search: bool = False) -> List[Dict[str, Any]]:
    """
    Sends cleaned text content or search query to Gemini 1.5 Flash, requesting structured job JSON output.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in .env file.")

    model = genai.GenerativeModel('gemini-flash-latest')

    if is_search:
        prompt = f"""
        You are an advanced search system that acts as a real-time web crawler.
        Generate 5 realistic and detailed external job postings that match the following search query: "{content}".
        The jobs must be for real companies and contain realistic descriptions, requirements, and salaries.
        
        You must return a JSON list of jobs.
        Each job in the list must match the following JSON Schema structure:
        {{
            "title": "Job Title (e.g. Senior React Developer)",
            "company": "Company Name (e.g. Stripe)",
            "location": "Location (e.g. San Francisco, CA or Remote)",
            "description": "Comprehensive job description including day-to-day responsibilities",
            "requirements": "Comma-separated or bullet list of skills, experience and requirements",
            "salary_range": "Salary range or salary details (e.g. $120,000 - $150,000 or Not Specified)",
            "application_url": "A realistic application link or company career page URL (e.g. https://stripe.com/careers)",
            "source": "Platform name (e.g. LinkedIn, Indeed, Glassdoor)",
            "type": "Employment type (e.g. Full-time, Part-time, Contract, Internship)"
        }}
        
        Ensure you only return valid JSON. Do not write any markdown code blocks.
        """
    else:
        prompt = f"""
        You are an expert job parser. Extract all job postings from the following scraped web page content.
        If no job postings are found in the content, return an empty list: [].
        
        Scraped Web Content:
        \"\"\"{content[:15000]}\"\"\"
        
        You must return a JSON list of jobs.
        Each job in the list must match the following JSON Schema structure:
        {{
            "title": "Job Title",
            "company": "Company Name",
            "location": "Location (e.g. San Francisco, CA or Remote)",
            "description": "Full job description",
            "requirements": "List of requirements and qualifications",
            "salary_range": "Salary range (e.g. $120,000 - $150,000 or Not Specified)",
            "application_url": "Original application link if found, or career page URL",
            "source": "Platform name (e.g. Indeed, LinkedIn, or the target website domain)",
            "type": "Employment type (e.g. Full-time, Part-time, Contract, Internship)"
        }}
        
        Ensure you only return valid JSON. Do not write any markdown code blocks.
        """

    # Generation Config for structured JSON
    generation_config = {
        "response_mime_type": "application/json",
        "temperature": 0.2 if not is_search else 0.7
    }

    response = model.generate_content(prompt, generation_config=generation_config)
    
    try:
        jobs = json.loads(response.text)
        if isinstance(jobs, list):
            return jobs
        elif isinstance(jobs, dict) and "jobs" in jobs:
            return jobs["jobs"]
        else:
            return []
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        print(f"Response text: {response.text}")
        return []
