import asyncio
from app.scraper import query_gemini_for_jobs

def test_search_scraping():
    print("Testing search scraping with Gemini 1.5 Flash...")
    query = "Junior Frontend Developer with React and Tailwind"
    jobs = query_gemini_for_jobs(query, is_search=True)
    
    print(f"Successfully retrieved {len(jobs)} jobs!")
    for idx, job in enumerate(jobs):
        print(f"\n--- Job #{idx+1} ---")
        print(f"Title: {job.get('title')}")
        print(f"Company: {job.get('company')}")
        print(f"Location: {job.get('location')}")
        print(f"Salary: {job.get('salary_range')}")
        print(f"Source: {job.get('source')}")
        print(f"URL: {job.get('application_url')}")
        print(f"Requirements: {job.get('requirements')}")
        
    assert len(jobs) > 0, "No jobs were scraped!"
    print("\nScraper validation passed successfully!")

if __name__ == "__main__":
    test_search_scraping()
