import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import TicketCard from '../components/TicketCard'
import '../styles/components/Tickets.css'

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams()
        params.set('limit', '50')
        params.set('offset', '0')
        if (q.trim()) params.set('search', q.trim())
        const { data } = await api.get(`/tickets/api/?${params.toString()}`)
        setTickets(Array.isArray(data) ? data : (data.items || []))
      } catch (e) {
        setError('Failed to load tickets')
      } finally {
        setLoading(false)
      }
    })()
  }, [q])

  if (loading) return <div className="loading-message">Loading tickets...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h1 className="tickets-title">Tickets</h1>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tickets" className="search-input" />
      </div>
      {tickets.length === 0 ? (
        <div className="no-tickets-message">
          <div className="no-tickets-icon">📭</div>
          <div className="no-tickets-text">No tickets yet.</div>
          <Link to="/tickets/new" className="add-ticket-button">Add Ticket</Link>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map(t => (<TicketCard key={t.id} ticket={t} />))}
        </div>
      )}
    </div>
  )
}


