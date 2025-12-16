import React, { useState } from 'react'
import JobSearchForm from './components/JobSearchForm'
import JobResults from './components/JobResults'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

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
        <h1>🔍 FindJobs2</h1>
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

