import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import CommentList from '../components/CommentList'
import { fetchCurrentUser } from '../lib/auth'
import '../styles/components/TicketDetail.css'

export default function TicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [me, setMe] = useState(null)
  const [timelineQuery, setTimelineQuery] = useState('')
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get(`/tickets/api/${id}/`)
      setTicket(data)
    } catch (e) {
      setError('Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(); fetchCurrentUser(api).then(setMe) }, [id])

  const canUpdate = useMemo(() => {
    if (!me || !ticket) return false
    const isOwner = ticket.created_by?.id === me.id
    const isAgentOrAdmin = ['agent', 'admin'].includes(me.role)
    return isOwner || isAgentOrAdmin
  }, [me, ticket])

  const addComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSaving(true)
    try {
      await api.post(`/tickets/api/${id}/comments/`, { content: comment })
      setComment('')
      await load()
    } catch (e) {
      setError('Failed to add comment')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (e) => {
    e.preventDefault()
    if (!newStatus) return
    setStatusUpdating(true)
    try {
      await api.patch(`/tickets/api/${id}/`, { status: newStatus, version: ticket.version })
      await load()
      setNewStatus('')
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to update status (maybe stale). Refresh and try again.')
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this ticket?')) return
    setDeleting(true)
    try {
      await api.delete(`/tickets/api/${id}/`)
      window.location.href = '/tickets'
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to delete ticket')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="loading-message">Loading...</div>
  if (error) return <div className="error-message">{error}</div>
  if (!ticket) return null

  return (
    <div className="ticket-detail-container">
      <div className="ticket-info-card">
        <div className="ticket-info-header">
          <h1 className="ticket-title">{ticket.title}</h1>
          <span className="ticket-status-badge">{ticket.status}</span>
        </div>
        <p className="ticket-description">{ticket.description}</p>
        {canUpdate && (
          <form onSubmit={updateStatus} className="ticket-status-form">
            <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className="status-select">
              <option value="">Change status...</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            <button disabled={statusUpdating || !newStatus} className="status-update-button">{statusUpdating ? 'Saving...' : 'Update'}</button>
          </form>
        )}
        {me?.role === 'admin' && (
          <button onClick={handleDelete} disabled={deleting} className="ticket-delete-button">
            {deleting ? 'Deleting...' : 'Delete ticket'}
          </button>
        )}
      </div>

      <div className="ticket-comments-card">
        <h2 className="comments-title">Comments</h2>
        <CommentList comments={ticket.comments} />
        <form onSubmit={addComment} className="comment-form">
          <input className="comment-input" placeholder="Write a comment" value={comment} onChange={e=>setComment(e.target.value)} />
          <button disabled={saving} className="comment-add-button">{saving ? 'Adding...' : 'Add'}</button>
        </form>
      </div>

      <div className="ticket-timeline-card">
        <div className="timeline-header">
          <h2 className="timeline-title">Timeline</h2>
          <input className="timeline-search-input" placeholder="Search timeline" value={timelineQuery} onChange={e=>setTimelineQuery(e.target.value)} />
        </div>
        <ul className="timeline-list">
          {(ticket.events || []).filter(ev => {
            const q = timelineQuery.trim().toLowerCase()
            if (!q) return true
            const blob = `${ev.action} ${JSON.stringify(ev.meta||{})} ${ev.actor?.username||''}`.toLowerCase()
            return blob.includes(q)
          }).map(ev => (
            <li key={ev.id} className="timeline-item">
              <span className="timeline-action-badge">{ev.action}</span>
              <span className="timeline-actor">{ev.actor?.username || 'system'}</span>
              <span className="timeline-timestamp">{new Date(ev.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}


