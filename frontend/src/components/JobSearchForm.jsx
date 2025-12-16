import React, { useState } from 'react'
import { cities } from '../data/cities'
import './JobSearchForm.css'

const JOB_BOARDS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'glassdoor', label: 'Glassdoor' },
  { value: 'zip_recruiter', label: 'ZipRecruiter' },
  { value: 'google', label: 'Google Jobs' },
  { value: 'bayt', label: 'Bayt' },
  { value: 'bdjobs', label: 'BDJobs' },
]

const JOB_TYPES = [
  { value: 'fulltime', label: 'Full Time' },
  { value: 'parttime', label: 'Part Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
]

const DESCRIPTION_FORMATS = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
]

const VERBOSITY_LEVELS = [
  { value: 0, label: 'Errors Only' },
  { value: 1, label: 'Errors + Warnings' },
  { value: 2, label: 'All Logs' },
]

function JobSearchForm({ onSearch, loading }) {
  const [formData, setFormData] = useState({
    site_name: ['linkedin'],
    search_term: '',
    google_search_term: '',
    location: '',
    distance: 50,
    job_type: '',
    is_remote: null,
    results_wanted: 10,
    easy_apply: null,
    description_format: 'markdown',
    offset: '',
    hours_old: '',
    verbose: 2,
    linkedin_fetch_description: true,
    linkedin_company_ids: '',
    country_indeed: '',
    enforce_annual_salary: null,
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      if (name === 'site_name') {
        const currentSites = formData.site_name || []
        if (checked) {
          setFormData({ ...formData, site_name: [...currentSites, value] })
        } else {
          setFormData({ ...formData, site_name: currentSites.filter(s => s !== value) })
        }
      } else {
        setFormData({ ...formData, [name]: checked })
      }
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value === '' ? '' : parseInt(value) })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleToggle = (name) => {
    setFormData({ ...formData, [name]: formData[name] === true ? false : (formData[name] === false ? null : true) })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Build request object, excluding empty strings and null values
    const requestData = {}
    
    // Required field
    if (formData.search_term.trim()) {
      requestData.search_term = formData.search_term.trim()
    } else {
      alert('Please enter a role/job title')
      return
    }

    // Add other fields only if they have values
    if (formData.site_name && formData.site_name.length > 0) {
      requestData.site_name = formData.site_name
    }
    
    if (formData.google_search_term.trim()) {
      requestData.google_search_term = formData.google_search_term.trim()
    }
    
    if (formData.location) {
      requestData.location = formData.location
    }
    
    if (formData.distance) {
      requestData.distance = formData.distance
    }
    
    if (formData.job_type) {
      requestData.job_type = formData.job_type
    }
    
    if (formData.is_remote !== null) {
      requestData.is_remote = formData.is_remote
    }
    
    if (formData.results_wanted) {
      requestData.results_wanted = formData.results_wanted
    }
    
    if (formData.easy_apply !== null) {
      requestData.easy_apply = formData.easy_apply
    }
    
    if (formData.description_format) {
      requestData.description_format = formData.description_format
    }
    
    if (formData.offset !== '') {
      requestData.offset = formData.offset
    }
    
    if (formData.hours_old !== '') {
      requestData.hours_old = formData.hours_old
    }
    
    if (formData.verbose !== undefined) {
      requestData.verbose = formData.verbose
    }
    
    if (formData.linkedin_fetch_description !== undefined) {
      requestData.linkedin_fetch_description = formData.linkedin_fetch_description
    }
    
    if (formData.linkedin_company_ids.trim()) {
      const ids = formData.linkedin_company_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      if (ids.length > 0) {
        requestData.linkedin_company_ids = ids
      }
    }
    
    if (formData.country_indeed.trim()) {
      requestData.country_indeed = formData.country_indeed.trim()
    }
    
    if (formData.enforce_annual_salary !== null) {
      requestData.enforce_annual_salary = formData.enforce_annual_salary
    }

    onSearch(requestData)
  }

  const getToggleLabel = (value) => {
    if (value === true) return 'Yes'
    if (value === false) return 'No'
    return 'Not Set'
  }

  return (
    <form onSubmit={handleSubmit} className="job-search-form">
      <div className="form-section">
        <h2>Basic Search</h2>
        
        <div className="form-group">
          <label htmlFor="search_term">Role / Job Title *</label>
          <input
            type="text"
            id="search_term"
            name="search_term"
            value={formData.search_term}
            onChange={handleChange}
            placeholder="e.g., Software Engineer, Data Scientist"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          >
            <option value="">Select a city...</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="site_name">Job Boards</label>
          <div className="checkbox-group">
            {JOB_BOARDS.map(board => (
              <label key={board.value} className="checkbox-label">
                <input
                  type="checkbox"
                  name="site_name"
                  value={board.value}
                  checked={formData.site_name?.includes(board.value)}
                  onChange={handleChange}
                />
                {board.label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="results_wanted">Results Wanted</label>
            <input
              type="number"
              id="results_wanted"
              name="results_wanted"
              value={formData.results_wanted}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="distance">Distance (miles)</label>
            <input
              type="number"
              id="distance"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="job_type">Job Type</label>
          <select
            id="job_type"
            name="job_type"
            value={formData.job_type}
            onChange={handleChange}
          >
            <option value="">Any</option>
            {JOB_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="toggle-section">
        <div className="toggle-group">
          <label>Remote Jobs</label>
          <button
            type="button"
            className={`toggle-btn ${formData.is_remote === true ? 'active-yes' : formData.is_remote === false ? 'active-no' : ''}`}
            onClick={() => handleToggle('is_remote')}
          >
            {getToggleLabel(formData.is_remote)}
          </button>
        </div>

        <div className="toggle-group">
          <label>Easy Apply</label>
          <button
            type="button"
            className={`toggle-btn ${formData.easy_apply === true ? 'active-yes' : formData.easy_apply === false ? 'active-no' : ''}`}
            onClick={() => handleToggle('easy_apply')}
          >
            {getToggleLabel(formData.easy_apply)}
          </button>
        </div>

        <div className="toggle-group">
          <label>Fetch Full Description (LinkedIn)</label>
          <button
            type="button"
            className={`toggle-btn ${formData.linkedin_fetch_description ? 'active-yes' : 'active-no'}`}
            onClick={() => setFormData({ ...formData, linkedin_fetch_description: !formData.linkedin_fetch_description })}
          >
            {formData.linkedin_fetch_description ? 'Yes' : 'No'}
          </button>
        </div>

        <div className="toggle-group">
          <label>Enforce Annual Salary</label>
          <button
            type="button"
            className={`toggle-btn ${formData.enforce_annual_salary === true ? 'active-yes' : formData.enforce_annual_salary === false ? 'active-no' : ''}`}
            onClick={() => handleToggle('enforce_annual_salary')}
          >
            {getToggleLabel(formData.enforce_annual_salary)}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? '▼' : '▶'} Advanced Options
      </button>

      {showAdvanced && (
        <div className="form-section advanced-section">
          <h3>Advanced Options</h3>

          <div className="form-group">
            <label htmlFor="google_search_term">Google Search Term</label>
            <input
              type="text"
              id="google_search_term"
              name="google_search_term"
              value={formData.google_search_term}
              onChange={handleChange}
              placeholder="Only for Google Jobs"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="offset">Offset</label>
              <input
                type="number"
                id="offset"
                name="offset"
                value={formData.offset}
                onChange={handleChange}
                min="0"
                placeholder="Start from result #"
              />
            </div>

            <div className="form-group">
              <label htmlFor="hours_old">Hours Old</label>
              <input
                type="number"
                id="hours_old"
                name="hours_old"
                value={formData.hours_old}
                onChange={handleChange}
                min="0"
                placeholder="Filter by age"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="linkedin_company_ids">LinkedIn Company IDs</label>
            <input
              type="text"
              id="linkedin_company_ids"
              name="linkedin_company_ids"
              value={formData.linkedin_company_ids}
              onChange={handleChange}
              placeholder="Comma-separated IDs (e.g., 123, 456)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="country_indeed">Country (Indeed/Glassdoor)</label>
            <input
              type="text"
              id="country_indeed"
              name="country_indeed"
              value={formData.country_indeed}
              onChange={handleChange}
              placeholder="e.g., United States, United Kingdom"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="description_format">Description Format</label>
              <select
                id="description_format"
                name="description_format"
                value={formData.description_format}
                onChange={handleChange}
              >
                {DESCRIPTION_FORMATS.map(format => (
                  <option key={format.value} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="verbose">Verbosity Level</label>
              <select
                id="verbose"
                name="verbose"
                value={formData.verbose}
                onChange={handleChange}
              >
                {VERBOSITY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Searching...' : '🔍 Search Jobs'}
      </button>
    </form>
  )
}

export default JobSearchForm

