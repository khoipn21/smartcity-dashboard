export interface RegisterRequest {
  username: string
  email: string
  password: string
  fullName: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface CityRequest {
  name: string
  country: string
  description?: string
}

export interface CityResponse {
  id: number
  name: string
  country: string
  description?: string
}

export interface ServiceCategoryRequest {
  name: string
  description?: string
}

export interface ServiceCategoryResponse {
  id: number
  name: string
  description?: string
} 