import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import '../styles/components/Register.css'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== password2) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.post('/users/api/register/', { username, email, password, password2, role: 'user' })
      navigate('/login')
    } catch (err) {
        const backendError = err?.response?.data?.error;
        if (backendError && backendError.message) {
            setError(backendError.message);
        } else {
            setError('Registration failed');
        }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <h1 className="register-title">Register</h1>
      <form onSubmit={onSubmit} className="register-form">
        <input className="register-input" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
        <input className="register-input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="register-input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <input className="register-input" placeholder="Confirm Password" type="password" value={password2} onChange={e=>setPassword2(e.target.value)} required />
        {error && <div className="register-error">{error}</div>}
        <button disabled={loading} className="register-button">
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <div className="register-login-link">Have an account? <Link to="/login" className="text-blue-600">Login</Link></div>
    </div>
  )
}


