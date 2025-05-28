import axios from 'axios'

// For debugging
console.log('API URL:', import.meta.env.VITE_API_URL)

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Hardcode temporarily to debug
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Add request interceptor to debug URLs
axiosInstance.interceptors.request.use((config) => {
    console.log('Making request to:', config.baseURL + config.url)
    return config
}, (error) => {
    return Promise.reject(error)
})

export default axiosInstance // Note: default export