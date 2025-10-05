import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Tickets from './pages/Tickets.jsx'
import TicketNew from './pages/TicketNew.jsx'
import TicketDetail from './pages/TicketDetail.jsx'
import Navbar from './components/Navbar.jsx'
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


