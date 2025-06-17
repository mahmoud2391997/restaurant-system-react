import axios, { type AxiosResponse, type AxiosError, AxiosRequestConfig } from "axios"
import { log } from "node:console"

// Error handler
export const handleApiError = (error: any): Error => {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data
    // You can customize error handling based on your API's error format
    if (serverError && typeof serverError === "object") {
      return new Error(serverError.message || "An unexpected error occurred")
    }
  }
  return error instanceof Error ? error : new Error("An unexpected error occurred")
}

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle session expiration
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Generic GET request\
export const get = async <T>(url: string, config?: AxiosRequestConfig)
: Promise<T> =>
{
  try {
    const response: AxiosResponse<T> = await api.get(url, config)
    return response.data;
  } catch (error) {
    throw handleApiError(error)
  }
}

// Generic POST request
export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig)
: Promise<T> =>
{
  try {
    const response: AxiosResponse<T> = await api.post(url, data, config)
    return response.data;
  } catch (error) {
    console.log(error)
    throw handleApiError(error)
  }
}

// Generic PUT request
export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig)
: Promise<T> =>
{
  try {
    const response: AxiosResponse<T> = await api.put(url, data, config)
    return response.data;
  } catch (error) {
    throw handleApiError(error)
  }
}

// Generic PATCH request
export const patch = async <T>(url: string, data?: any, config?: AxiosRequestConfig)
: Promise<T> =>
{
  try {
    const response: AxiosResponse<T> = await api.patch(url, data, config)
    return response.data;
  } catch (error) {
    throw handleApiError(error)
  }
}

// Generic DELETE request
export const del = async <T>(url: string, config?: AxiosRequestConfig)
: Promise<T> =>
{
  try {
    const response: AxiosResponse<T> = await api.delete(url, config)
    return response.data;
  } catch (error) {
    throw handleApiError(error)
  }
}

export default api
