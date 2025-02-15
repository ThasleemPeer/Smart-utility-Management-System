import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Add axios interceptor to handle token expiration
const setupAxiosInterceptors = () => {
  const token = localStorage.getItem('access_token');
  if (token) {
    // Add token to all requests
    fetch = (originalFetch => {
      return async (...args) => {
        let [resource, config] = args;
        config = config || {};
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await originalFetch(resource, config);
          if (response.status === 401) {
            // Token expired
            localStorage.removeItem('access_token');
            window.location.href = '/login';
            return Promise.reject('Session expired');
          }
          return response;
        } catch (error) {
          return Promise.reject(error);
        }
      };
    })(fetch);
  }
};

setupAxiosInterceptors();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
