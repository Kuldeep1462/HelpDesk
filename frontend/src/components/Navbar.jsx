import { Link, useNavigate } from 'react-router-dom'
import { logout, getAccessToken, fetchCurrentUser } from '../lib/auth.js'
import { useEffect, useState } from 'react'
import api from '../lib/api.js'
import '../styles/components/Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const isAuthed = !!getAccessToken()
  const [me, setMe] = useState(null)

  useEffect(() => {
    if (isAuthed) {
      fetchCurrentUser(api).then(setMe)
    } else {
      setMe(null)
    }
  }, [isAuthed])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/tickets" className="navbar-brand">Helpdesk</Link>
        <div className="navbar-links">
          {isAuthed && <>
            <Link to="/tickets" className="nav-link">Tickets</Link>
            <Link to="/tickets/new" className="nav-link">New Ticket</Link>
            {me && <span className="navbar-role">Role: {me.role}</span>}
            <button onClick={handleLogout} className="nav-logout">Logout</button>
          </>}
          {!isAuthed && <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>}
        </div>
      </div>
    </nav>
  )
}


