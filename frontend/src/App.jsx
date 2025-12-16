import React, { useState } from 'react'
import JobSearchForm from './components/JobSearchForm'
import JobResults from './components/JobResults'
import './App.css'

// Use environment variable or fallback to localhost for development
// In production (Vercel), use relative /api path
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // Production: use relative path to Vercel serverless function
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')  // Development: use localhost or env var

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useState(null)

  const handleSearch = async (params) => {
    setLoading(true)
    setError(null)
    setSearchParams(params)

    try {
      const response = await fetch(`${API_BASE_URL}/scrape_jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch jobs')
      }

      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (err) {
      setError(err.message)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔍 MultiBoard Jobs</h1>
        <p>Search jobs from multiple job boards</p>
      </header>

      <div className="app-container">
        <JobSearchForm onSearch={handleSearch} loading={loading} />
        
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <JobResults 
          jobs={jobs} 
          loading={loading}
          searchParams={searchParams}
        />
      </div>
    </div>
  )
}

export default App

