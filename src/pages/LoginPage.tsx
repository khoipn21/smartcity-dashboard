import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@api/auth'
import { useAuthStore } from '@store/authStore'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  sub: string
  role: string
  exp: number
}

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const setToken = useAuthStore((state) => state.setToken)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await login({ username, password })
      const token = response.data.token

      // Decode the JWT token to extract the role
      const decoded: JwtPayload = jwtDecode(token)

      // Check if the user's role is admin
      if (decoded.role === 'ROLE_ADMIN') {
        setToken(token)
        navigate('/admin')
      } else {
        alert('Access denied. You do not have admin privileges.')
      }
    } catch (error) {
      console.error('Login failed', error)
      alert('Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl mb-6 text-center text-primary">Admin Login</h2>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your username"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary-light transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  )
}

export default LoginPage 