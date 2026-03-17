import React, { useState } from 'react'
import JobSearchForm from './components/JobSearchForm'
import JobResults from './components/JobResults'
import './App.css'

// Use Render backend by default, allow override via env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://multiboard-jobs-1.onrender.com'

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

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      const isJson = contentType && contentType.includes('application/json')

      if (!response.ok) {
        // Try to parse error as JSON, fallback to text
        let errorMessage = `Server error: ${response.status} ${response.statusText}`
        try {
          if (isJson) {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorData.message || errorMessage
          } else {
            const errorText = await response.text()
            // If it's an HTML error page, extract meaningful info
            if (errorText.includes('A server error occurred') || errorText.includes('Function Error') || errorText.includes('502') || errorText.includes('503')) {
              errorMessage = 'Server error: The backend service may be unavailable or timed out. Please try again later or check the Vercel function logs.'
            } else if (errorText.includes('504') || errorText.includes('Gateway Timeout')) {
              errorMessage = 'Request timed out. The job search may take too long. Try reducing the number of results or job boards.'
            } else {
              errorMessage = errorText.substring(0, 200) // Limit error text length
            }
          }
        } catch (parseError) {
          errorMessage = `Failed to fetch jobs: ${response.status} ${response.statusText}. The server may be experiencing issues.`
        }
        throw new Error(errorMessage)
      }

      // Parse successful response
      if (!isJson) {
        const text = await response.text()
        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`)
      }

      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (err) {
      // Handle network errors, timeouts, etc.
      let errorMessage = err.message
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error: Could not connect to the server. Please check your connection.'
      } else if (err.message.includes('timeout') || err.message.includes('Unexpected token')) {
        errorMessage = 'Request timed out or received invalid response. The job search may take too long, or there may be a server configuration issue. Try reducing the number of results or job boards.'
      }
      setError(errorMessage)
      setJobs([])
      console.error('Error fetching jobs:', err)
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

