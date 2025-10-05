import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api.js'
import '../styles/components/TicketNew.css'

export default function TicketNew() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/tickets/api/', { title, description })
      navigate('/tickets')
    } catch (e) {
      setError('Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ticket-new-container">
      <h1 className="ticket-new-title">New Ticket</h1>
      <form onSubmit={onSubmit} className="ticket-new-form">
        <input className="ticket-new-input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
        <textarea className="ticket-new-textarea" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} required />
        {error && <div className="ticket-new-error">{error}</div>}
        <button disabled={loading} className="ticket-new-button">
          {loading ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
    </div>
  )
}


