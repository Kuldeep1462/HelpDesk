import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Tickets from './pages/Tickets'
import TicketNew from './pages/TicketNew'
import TicketDetail from './pages/TicketDetail'
import Navbar from './components/Navbar'
import { getAccessToken } from './lib/auth.js'
import './styles/components/App.css'

function PrivateRoute({ children }) {
  const token = getAccessToken()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tickets" element={<PrivateRoute><Tickets /></PrivateRoute>} />
          <Route path="/tickets/new" element={<PrivateRoute><TicketNew /></PrivateRoute>} />
          <Route path="/tickets/:id" element={<PrivateRoute><TicketDetail /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/tickets" replace />} />
        </Routes>
      </div>
    </div>
  )
}


