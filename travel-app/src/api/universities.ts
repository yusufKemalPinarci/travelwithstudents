// Free University API
// http://universities.hipolabs.com

export interface University {
  name: string
  country: string
  alpha_two_code: string
  web_pages: string[]
  domains: string[]
  state_province: string | null
}

const API_BASE = 'http://universities.hipolabs.com'

export const searchUniversities = async (query: string, country?: string): Promise<University[]> => {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    const params = new URLSearchParams({
      name: query.trim()
    })

    if (country) {
      params.append('country', country)
    }

    const response = await fetch(`${API_BASE}/search?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch universities')
    }

    const data: University[] = await response.json()
    return data.slice(0, 10) // Limit to 10 results
  } catch (error) {
    console.error('Error fetching universities:', error)
    return []
  }
}
