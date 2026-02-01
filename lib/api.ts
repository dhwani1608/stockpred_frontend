// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface PredictionRequest {
  symbol: string
}

export interface BatchPredictionRequest {
  symbols: string[]
}

export interface PredictionResponse {
  symbol: string
  direction: 'UP' | 'DOWN'
  confidence: number
  signal: 'BUY' | 'SELL' | 'NO_TRADE'
  timestamp: string
}

export interface User {
  id: string
  email: string
  name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  user: User
  token: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = API_BASE_URL
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value
        }
      })
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Prediction endpoints
  async predict(symbol: string): Promise<PredictionResponse> {
    return this.request<PredictionResponse>('/predict/', {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    })
  }

  async batchPredict(symbols: string[]): Promise<PredictionResponse[]> {
    return this.request<PredictionResponse[]>('/predict/batch', {
      method: 'POST',
      body: JSON.stringify({ symbols }),
    })
  }

  async getPredictionHistory(symbol?: string): Promise<PredictionResponse[]> {
    const endpoint = symbol
      ? `/predict/history/${symbol}`
      : '/history/predictions'
    return this.request<PredictionResponse[]>(endpoint)
  }
}

export const apiClient = new ApiClient()
