# FindJobs2

A LinkedIn job scraper backend API built with FastAPI and JobSpy library.

## Backend

### Overview

The backend is a FastAPI-based REST API that scrapes LinkedIn job listings using the JobSpy Python library. It provides endpoints to search for jobs based on keywords, location, and other filters.

### Prerequisites

- Python 3.10 or higher (Python 3.11 or 3.12 recommended)
- pip package manager
- PowerShell (for Windows)

### Setup and Installation

#### Step 1: Create Virtual Environment

Navigate to the `backend` directory and create a virtual environment:

```powershell
cd backend
python -m venv venv
```

#### Step 2: Activate Virtual Environment

**On Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

You should see `(venv)` at the beginning of your command prompt when the virtual environment is activated.

#### Step 3: Install Dependencies

Run the installation script to install all required packages:

```powershell
.\install.ps1
```

This script will automatically install:
- Core web framework packages (FastAPI, Uvicorn, Pydantic)
- Data processing packages (Pandas, NumPy)
- JobSpy library (with `--no-deps` flag to avoid version conflicts)
- JobSpy dependencies (BeautifulSoup4, lxml, requests, markdownify, regex, tls-client)

#### Step 4: Run the Application

Start the server:

```powershell
python app.py
```

The server will start on **http://localhost:8000**

You should see output indicating the server is running. The API will be available at:
- **API Base URL**: `http://localhost:8000`
- **Interactive API Documentation**: `http://localhost:8000/docs`
- **Alternative API Documentation**: `http://localhost:8000/redoc`

### API Endpoints

#### 1. Root Endpoint
- **URL**: `GET /`
- **Description**: Returns API information and available endpoints

#### 2. Scrape Jobs (GET)
- **URL**: `GET /scrape_jobs`
- **Description**: Scrapes LinkedIn jobs using query parameters

#### 3. Scrape Jobs (POST)
- **URL**: `POST /scrape_jobs`
- **Description**: Scrapes LinkedIn jobs using JSON request body

#### 4. Health Check
- **URL**: `GET /health`
- **Description**: Returns server health status

### Available Filters/Parameters

The `/scrape_jobs` endpoint accepts the following parameters:

| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| `search_term` | string | **Yes** | - | - | Job title or keywords to search for (e.g., "software engineer", "data scientist") |
| `location` | string | No | `null` | - | Job location filter (e.g., "San Francisco", "New York", "Remote") |
| `results_wanted` | integer | No | `10` | 1-100 | Number of job results to return (minimum: 1, maximum: 100) |

### Using cURL Commands

#### GET Request with Query Parameters

**Basic search (only search term):**
```bash
curl "http://localhost:8000/scrape_jobs?search_term=software%20engineer"
```

**Search with location:**
```bash
curl "http://localhost:8000/scrape_jobs?search_term=software%20engineer&location=San%20Francisco"
```

**Search with location and custom result count:**
```bash
curl "http://localhost:8000/scrape_jobs?search_term=data%20scientist&location=New%20York&results_wanted=20"
```

**Full example with all parameters:**
```bash
curl "http://localhost:8000/scrape_jobs?search_term=python%20developer&location=Remote&results_wanted=15"
```

#### POST Request with JSON Body

**Basic search:**
```bash
curl -X POST "http://localhost:8000/scrape_jobs" \
  -H "Content-Type: application/json" \
  -d "{\"search_term\": \"software engineer\"}"
```

**Search with location:**
```bash
curl -X POST "http://localhost:8000/scrape_jobs" \
  -H "Content-Type: application/json" \
  -d "{\"search_term\": \"software engineer\", \"location\": \"San Francisco\"}"
```

**Search with all parameters:**
```bash
curl -X POST "http://localhost:8000/scrape_jobs" \
  -H "Content-Type: application/json" \
  -d "{\"search_term\": \"data scientist\", \"location\": \"New York\", \"results_wanted\": 25}"
```

#### Health Check

```bash
curl "http://localhost:8000/health"
```

#### Root Endpoint

```bash
curl "http://localhost:8000/"
```

### Response Format

#### Success Response

```json
{
  "message": "Jobs scraped successfully",
  "jobs": [
    {
      "site": "linkedin",
      "job_url": "https://...",
      "job_url_direct": "https://...",
      "title": "Software Engineer",
      "company": "Company Name",
      "location": "San Francisco, CA",
      "date_posted": "2024-01-15",
      "description": "Job description...",
      ...
    }
  ],
  "count": 10
}
```

#### No Jobs Found Response

```json
{
  "message": "No jobs found for the given criteria",
  "jobs": [],
  "count": 0
}
```

#### Error Response

```json
{
  "detail": "Error scraping jobs: <error message>"
}
```

### Example Usage Scenarios

#### Search for Remote Python Jobs
```bash
curl "http://localhost:8000/scrape_jobs?search_term=python%20developer&location=Remote&results_wanted=30"
```

#### Search for Data Science Jobs in Specific City
```bash
curl "http://localhost:8000/scrape_jobs?search_term=data%20scientist&location=Seattle&results_wanted=15"
```

#### Search for Multiple Keywords
```bash
curl "http://localhost:8000/scrape_jobs?search_term=machine%20learning%20engineer&location=San%20Francisco&results_wanted=20"
```

### Interactive API Documentation

Once the server is running, you can access the interactive Swagger UI documentation at:

**http://localhost:8000/docs**

This provides a user-friendly interface to:
- View all available endpoints
- Test API calls directly from the browser
- See request/response schemas
- Try different parameter combinations

### Troubleshooting

#### Virtual Environment Not Activated

If you get import errors, make sure your virtual environment is activated:
```powershell
.\venv\Scripts\Activate.ps1
```

You should see `(venv)` in your prompt.

#### Port Already in Use

If port 8000 is already in use, you can change it in `app.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Change port number
```

#### JobSpy Import Errors

If you encounter JobSpy import errors, reinstall it:
```powershell
pip install python-jobspy --no-deps
pip install beautifulsoup4 markdownify regex requests tls-client
```

### Important Notes

⚠️ **Legal and Ethical Compliance**: 
- Scraping LinkedIn data may violate their Terms of Service
- Ensure you have necessary permissions and comply with all legal guidelines
- Use responsibly and respect rate limits

⚠️ **Technical Considerations**:
- LinkedIn uses dynamic content loading and anti-scraping mechanisms
- JobSpy handles many challenges, but scraping may occasionally fail
- Be aware that LinkedIn's HTML structure may change, breaking the scraper
- Consider implementing retry logic and error handling in production

### License

This project uses the JobSpy library. Please refer to the [JobSpy repository](https://github.com/speedyapply/JobSpy) for its license and terms.

