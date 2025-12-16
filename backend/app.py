"""
FastAPI backend server for LinkedIn job scraping using JobSpy
"""
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.responses import JSONResponse
from typing import Optional
from pydantic import BaseModel
import pandas as pd
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from jobspy import scrape_jobs
except ImportError:
    logger.error("JobSpy library not found. Please install it using: pip install python-jobspy")
    raise

app = FastAPI(
    title="LinkedIn Job Scraper API",
    description="API for scraping LinkedIn jobs using JobSpy library",
    version="1.0.0"
)


# Pydantic model for POST request body
class JobSearchRequest(BaseModel):
    search_term: str
    location: Optional[str] = None
    results_wanted: int = 10


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "LinkedIn Job Scraper API",
        "endpoints": {
            "scrape_jobs": "/scrape_jobs?search_term=<term>&location=<location>&results_wanted=<number>",
            "docs": "/docs"
        }
    }


def _scrape_jobs_logic(search_term: str, location: Optional[str], results_wanted: int):
    """Shared logic for scraping jobs"""
    logger.info(f"Scraping jobs for: search_term='{search_term}', location='{location}', results_wanted={results_wanted}")
    
    # Prepare parameters for JobSpy
    scrape_params = {
        'site_name': ['linkedin'],
        'search_term': search_term,
        'results_wanted': results_wanted,
        'linkedin_fetch_description': True
    }
    
    # Add location if provided
    if location:
        scrape_params['location'] = location
    
    # Scrape jobs using JobSpy (this is a blocking call)
    jobs_df = scrape_jobs(**scrape_params)
    
    logger.info(f"Scraped {len(jobs_df)} jobs")
    
    # Check if any jobs were found
    if jobs_df.empty:
        return JSONResponse(
            status_code=200,
            content={
                "message": "No jobs found for the given criteria",
                "jobs": [],
                "count": 0
            }
        )
    
    # Convert DataFrame to list of dictionaries
    jobs_list = jobs_df.to_dict(orient='records')
    
    # Convert any non-serializable types (like pandas Timestamp) to strings
    for job in jobs_list:
        for key, value in job.items():
            if pd.isna(value):
                job[key] = None
            elif hasattr(value, 'isoformat'):  # Handle datetime objects
                job[key] = value.isoformat()
    
    return JSONResponse(
        status_code=200,
        content={
            "message": "Jobs scraped successfully",
            "jobs": jobs_list,
            "count": len(jobs_list)
        }
    )


@app.get("/scrape_jobs")
async def scrape_jobs_get(
    search_term: str = Query(..., description="Job search term (e.g., 'software engineer', 'data scientist')"),
    location: Optional[str] = Query(None, description="Job location (e.g., 'San Francisco', 'New York')"),
    results_wanted: int = Query(10, ge=1, le=100, description="Number of results to return (1-100)")
):
    """
    Scrape LinkedIn jobs based on search criteria (GET method with query parameters)
    
    Args:
        search_term: The job title or keywords to search for
        location: Optional location filter
        results_wanted: Number of job results to return (default: 10, max: 100)
    
    Returns:
        JSON array of job listings
    """
    try:
        return _scrape_jobs_logic(search_term, location, results_wanted)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error scraping jobs: {str(e)}"
        )


@app.post("/scrape_jobs")
async def scrape_jobs_post(request: JobSearchRequest):
    """
    Scrape LinkedIn jobs based on search criteria (POST method with JSON body)
    
    Request body:
        - search_term: The job title or keywords to search for (required)
        - location: Optional location filter
        - results_wanted: Number of job results to return (default: 10, max: 100)
    
    Returns:
        JSON array of job listings
    """
    try:
        if request.results_wanted < 1 or request.results_wanted > 100:
            raise HTTPException(status_code=400, detail="results_wanted must be between 1 and 100")
        return _scrape_jobs_logic(request.search_term, request.location, request.results_wanted)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error scraping jobs: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "LinkedIn Job Scraper API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

