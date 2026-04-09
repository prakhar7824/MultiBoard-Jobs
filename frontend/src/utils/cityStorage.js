const CUSTOM_CITIES_KEY = 'multiboard_custom_cities'

export const getCustomCities = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_CITIES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading custom cities:', error)
    return []
  }
}

export const addCustomCity = (city) => {
  if (!city || city.trim() === '') return false
  
  const cityName = city.trim()
  const customCities = getCustomCities()
  
  // Check if city already exists
  if (customCities.includes(cityName)) {
    return false // City already exists
  }
  
  // Add city
  customCities.push(cityName)
  
  try {
    localStorage.setItem(CUSTOM_CITIES_KEY, JSON.stringify(customCities))
    return true
  } catch (error) {
    console.error('Error saving custom city:', error)
    return false
  }
}

export const removeCustomCity = (city) => {
  const customCities = getCustomCities()
  const filtered = customCities.filter(c => c !== city)
  
  try {
    localStorage.setItem(CUSTOM_CITIES_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error removing custom city:', error)
    return false
  }
}

export const getAllCities = (predefinedCities) => {
  const customCities = getCustomCities()
  // Merge and remove duplicates
  const allCities = [...new Set([...predefinedCities, ...customCities])]
  return allCities.sort()
}

