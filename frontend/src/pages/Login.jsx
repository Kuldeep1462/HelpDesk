import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { setTokens } from '../lib/auth'
import '../styles/components/Login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/tokens/', { username, password })
      setTokens(data)
      navigate('/tickets')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      <form onSubmit={onSubmit} className="login-form">
        <input className="login-input" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
        <input className="login-input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <div className="login-error">{error}</div>}
        <button disabled={loading} className="login-button">
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <div className="login-register-link">No account? <Link to="/register" className="text-blue-600">Register</Link></div>
      <div className='register-login-link'>For admin login- admin@mail.com  password- admin@123</div>
    </div>
  )
}


