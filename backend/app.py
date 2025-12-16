"""
FastAPI backend server for LinkedIn job scraping using JobSpy
"""
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Union
from pydantic import BaseModel, Field
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
    title="MultiBoard Jobs API",
    description="API for scraping jobs from multiple job boards using JobSpy library",
    version="1.0.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic model for POST request body with all JobSpy parameters
class JobSearchRequest(BaseModel):
    site_name: Optional[Union[List[str], str]] = Field(default=['linkedin'], description="Job boards: linkedin, zip_recruiter, indeed, glassdoor, google, bayt, bdjobs")
    search_term: str = Field(..., description="Job title or keywords to search for")
    google_search_term: Optional[str] = Field(None, description="Search term for Google jobs (only param for filtering Google jobs)")
    location: Optional[str] = Field(None, description="Job location")
    distance: Optional[int] = Field(50, ge=1, description="Distance in miles (default: 50)")
    job_type: Optional[str] = Field(None, description="Job type: fulltime, parttime, internship, contract")
    is_remote: Optional[bool] = Field(None, description="Filter for remote jobs")
    results_wanted: Optional[int] = Field(10, ge=1, description="Number of job results to retrieve")
    easy_apply: Optional[bool] = Field(None, description="Filter for jobs hosted on job board site")
    description_format: Optional[str] = Field("markdown", description="Format: markdown or html")
    offset: Optional[int] = Field(None, ge=0, description="Start search from offset (e.g., 25 starts from 25th result)")
    hours_old: Optional[int] = Field(None, ge=0, description="Filter jobs by hours since posted")
    verbose: Optional[int] = Field(2, ge=0, le=2, description="Verbosity: 0=errors only, 1=errors+warnings, 2=all logs")
    linkedin_fetch_description: Optional[bool] = Field(True, description="Fetch full description for LinkedIn")
    linkedin_company_ids: Optional[List[int]] = Field(None, description="Search LinkedIn jobs with specific company IDs")
    country_indeed: Optional[str] = Field(None, description="Filter country on Indeed & Glassdoor")
    enforce_annual_salary: Optional[bool] = Field(None, description="Convert wages to annual salary")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "MultiBoard Jobs API",
        "endpoints": {
            "scrape_jobs": "/scrape_jobs?search_term=<term>&location=<location>&results_wanted=<number>",
            "docs": "/docs"
        }
    }


def _scrape_jobs_logic(request: JobSearchRequest):
    """Shared logic for scraping jobs with all JobSpy parameters"""
    logger.info(f"Scraping jobs with parameters: {request.dict(exclude_none=True)}")
    
    # Prepare parameters for JobSpy - only include non-None values
    scrape_params = {}
    
    # Convert site_name to list if it's a string
    site_names = []
    if request.site_name:
        if isinstance(request.site_name, str):
            site_names = [request.site_name]
        else:
            site_names = request.site_name.copy()
    
    # Required parameter
    scrape_params['search_term'] = request.search_term
    
    # Optional parameters - only add if not None
    optional_params = {
        'google_search_term': request.google_search_term,
        'location': request.location,
        'distance': request.distance,
        'job_type': request.job_type,
        'is_remote': request.is_remote,
        'results_wanted': request.results_wanted,
        'easy_apply': request.easy_apply,
        'description_format': request.description_format,
        'offset': request.offset,
        'hours_old': request.hours_old,
        'verbose': request.verbose,
        'linkedin_fetch_description': request.linkedin_fetch_description,
        'linkedin_company_ids': request.linkedin_company_ids,
        'country_indeed': request.country_indeed,
        'enforce_annual_salary': request.enforce_annual_salary,
    }
    
    for key, value in optional_params.items():
        if value is not None:
            scrape_params[key] = value
    
    # Handle BDJobs compatibility issue - it doesn't support user_agent parameter
    # Try with all sites first, if BDJobs fails, retry without it
    jobs_df = None
    original_sites = site_names.copy() if site_names else ['linkedin']
    
    try:
        scrape_params['site_name'] = site_names if site_names else ['linkedin']
        jobs_df = scrape_jobs(**scrape_params)
    except TypeError as e:
        error_msg = str(e)
        # Check if error is related to BDJobs and user_agent
        if 'bdjobs' in str(e).lower() or 'user_agent' in str(e).lower():
            logger.warning(f"BDJobs compatibility issue detected: {error_msg}")
            logger.info("Retrying without BDJobs...")
            
            # Remove BDJobs from site list and retry
            filtered_sites = [s for s in original_sites if s.lower() != 'bdjobs']
            
            if not filtered_sites:
                # If BDJobs was the only site, default to LinkedIn
                filtered_sites = ['linkedin']
                logger.warning("BDJobs was the only selected site, defaulting to LinkedIn")
            
            scrape_params['site_name'] = filtered_sites
            
            try:
                jobs_df = scrape_jobs(**scrape_params)
                logger.info(f"Successfully scraped from {filtered_sites} (BDJobs excluded due to compatibility)")
            except Exception as retry_error:
                error_msg = f"Error scraping jobs after retry: {str(retry_error)}"
                logger.error(error_msg)
                raise Exception(error_msg)
        else:
            # Re-raise if it's a different error
            raise
    except Exception as e:
        # Re-raise to be handled by the endpoint
        raise
    
    if jobs_df is None or jobs_df.empty:
        logger.warning("No jobs found or jobs_df is None")
    else:
        logger.info(f"Scraped {len(jobs_df)} jobs")
    
    # Check if any jobs were found
    if jobs_df is None or jobs_df.empty:
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
    site_name: Optional[str] = Query(None, description="Job board: linkedin, zip_recruiter, indeed, glassdoor, google, bayt, bdjobs"),
    location: Optional[str] = Query(None, description="Job location (e.g., 'San Francisco', 'New York')"),
    results_wanted: int = Query(10, ge=1, description="Number of results to return")
):
    """
    Scrape jobs based on search criteria (GET method with query parameters)
    """
    try:
        # Create request object from query parameters
        request = JobSearchRequest(
            search_term=search_term,
            site_name=[site_name] if site_name else ['linkedin'],
            location=location,
            results_wanted=results_wanted
        )
        return _scrape_jobs_logic(request)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error scraping jobs: {str(e)}"
        )


@app.post("/scrape_jobs")
async def scrape_jobs_post(request: JobSearchRequest):
    """
    Scrape jobs based on search criteria (POST method with JSON body)
    Supports all JobSpy parameters for advanced filtering
    """
    try:
        return _scrape_jobs_logic(request)
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
    return {"status": "healthy", "service": "MultiBoard Jobs API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Vercel serverless handler using Mangum
try:
    from mangum import Mangum
    handler = Mangum(app, lifespan="off")
except ImportError:
    # Fallback if mangum is not installed (for local development)
    handler = app

