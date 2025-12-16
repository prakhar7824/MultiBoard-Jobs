# FindJobs2 Frontend

A modern React-based frontend for the FindJobs2 job scraper application.

## Features

- 🔍 Advanced job search with multiple filters
- 🌍 Worldwide city selection dropdown
- 📊 Multiple job board support (LinkedIn, Indeed, Glassdoor, etc.)
- 📥 Excel export functionality
- 🎨 Modern, responsive UI
- ⚡ Fast and efficient

## Prerequisites

- Node.js 16+ and npm
- Backend server running on `http://localhost:8000`

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Available Filters

### Basic Filters
- **Role/Job Title** (required): Search term for job titles
- **Location**: Dropdown with major cities worldwide
- **Job Boards**: Multi-select for different job sites
- **Results Wanted**: Number of results to retrieve
- **Distance**: Search radius in miles
- **Job Type**: Full-time, Part-time, Internship, Contract

### Toggle Options
- **Remote Jobs**: Filter for remote positions
- **Easy Apply**: Filter for easy apply jobs
- **Fetch Full Description**: Get complete job descriptions (LinkedIn)
- **Enforce Annual Salary**: Convert wages to annual salary

### Advanced Options
- **Google Search Term**: Specific term for Google Jobs
- **Offset**: Start search from a specific result number
- **Hours Old**: Filter jobs by posting age
- **LinkedIn Company IDs**: Search specific companies
- **Country**: Filter by country (Indeed/Glassdoor)
- **Description Format**: Markdown or HTML
- **Verbosity Level**: Control logging verbosity

## Excel Export

Click the "Download Excel" button to export all job results to an Excel file. The file includes all available job data fields.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── JobSearchForm.jsx    # Search form with all filters
│   │   └── JobResults.jsx        # Results display and export
│   ├── data/
│   │   └── cities.js             # Worldwide cities list
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # App styles
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Technologies Used

- React 18
- Vite
- Axios (for API calls)
- XLSX (for Excel export)

