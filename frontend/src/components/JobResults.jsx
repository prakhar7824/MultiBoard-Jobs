import React from 'react'
import * as XLSX from 'xlsx'
import './JobResults.css'

function JobResults({ jobs, loading, searchParams }) {
  const exportToExcel = () => {
    if (!jobs || jobs.length === 0) {
      alert('No jobs to export')
      return
    }

    // Flatten nested objects for Excel
    const flattenedJobs = jobs.map(job => {
      const flat = {}
      for (const [key, value] of Object.entries(job)) {
        if (value === null || value === undefined) {
          flat[key] = ''
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          // Flatten nested objects
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            flat[`${key}_${nestedKey}`] = nestedValue || ''
          }
        } else if (Array.isArray(value)) {
          flat[key] = value.join(', ')
        } else {
          flat[key] = value
        }
      }
      return flat
    })

    const worksheet = XLSX.utils.json_to_sheet(flattenedJobs)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jobs')

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const searchTerm = searchParams?.search_term?.replace(/[^a-z0-9]/gi, '_') || 'jobs'
    const filename = `jobs_${searchTerm}_${timestamp}.xlsx`

    XLSX.writeFile(workbook, filename)
  }

  if (loading) {
    return (
      <div className="job-results">
        <div className="loading">
          <div className="spinner"></div>
          <p>Searching for jobs... This may take a moment.</p>
        </div>
      </div>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="job-results">
        <div className="no-results">
          <p>No jobs found. Try adjusting your search criteria.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="job-results">
      <div className="results-header">
        <h2>Found {jobs.length} Job{jobs.length !== 1 ? 's' : ''}</h2>
        <button onClick={exportToExcel} className="export-btn">
          📥 Download Excel
        </button>
      </div>

      <div className="jobs-grid">
        {jobs.map((job, index) => (
          <div key={index} className="job-card">
            <div className="job-header">
              <h3 className="job-title">{job.title || 'No Title'}</h3>
              <span className="job-site">{job.site || 'Unknown'}</span>
            </div>
            
            <div className="job-company">
              <strong>Company:</strong> {job.company || 'Not specified'}
            </div>
            
            <div className="job-location">
              <strong>Location:</strong> {job.location || 'Not specified'}
            </div>

            {job.date_posted && (
              <div className="job-date">
                <strong>Posted:</strong> {new Date(job.date_posted).toLocaleDateString()}
              </div>
            )}

            {job.salary && (
              <div className="job-salary">
                <strong>Salary:</strong> {job.salary}
              </div>
            )}

            {job.job_type && (
              <div className="job-type">
                <strong>Type:</strong> {job.job_type}
              </div>
            )}

            {job.description && (
              <div className="job-description">
                <strong>Description:</strong>
                <div 
                  className="description-text"
                  dangerouslySetInnerHTML={{ 
                    __html: job.description.length > 300 
                      ? job.description.substring(0, 300) + '...' 
                      : job.description 
                  }}
                />
              </div>
            )}

            <div className="job-links">
              {job.job_url && (
                <a 
                  href={job.job_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="job-link"
                >
                  View Job
                </a>
              )}
              {job.job_url_direct && job.job_url_direct !== job.job_url && (
                <a 
                  href={job.job_url_direct} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="job-link direct"
                >
                  Direct Link
                </a>
              )}
            </div>

            {/* Show all other fields in a collapsible section */}
            <details className="job-details">
              <summary>View All Details</summary>
              <div className="details-content">
                {Object.entries(job).map(([key, value]) => {
                  if (['title', 'company', 'location', 'date_posted', 'salary', 'job_type', 'description', 'job_url', 'job_url_direct', 'site'].includes(key)) {
                    return null
                  }
                  return (
                    <div key={key} className="detail-item">
                      <strong>{key.replace(/_/g, ' ')}:</strong>{' '}
                      {value === null || value === undefined 
                        ? 'N/A' 
                        : typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : String(value)}
                    </div>
                  )
                })}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  )
}

export default JobResults

