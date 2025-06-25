export interface User {
  id: string
  email: string
  created_at: string
}

export interface ProductListing {
  id: string
  user_id: string
  title: string
  description: string
  image_url: string
  created_at: string
  updated_at: string
}

export interface CreateListingData {
  title: string
  description: string
  image_url: string
}

export interface UpdateListingData {
  title?: string
  description?: string
  image_url?: string
}

export interface AIAnalysisResponse {
  title: string
  description: string
  confidence: number
}

export interface UploadResponse {
  url: string
  path: string
}
