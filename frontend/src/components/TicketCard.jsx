import { Link } from 'react-router-dom'
import '../styles/components/TicketCard.css'

export default function TicketCard({ ticket }) {
  return (
    <Link to={`/tickets/${ticket.id}`} className="ticket-card">
      <div className="ticket-card-header">
        <h3 className="ticket-card-title">{ticket.title}</h3>
        <span className="ticket-card-status">{ticket.status}</span>
      </div>
      <p className="ticket-card-description">{ticket.description}</p>
      <div className="ticket-card-author">By {ticket.created_by?.username}</div>
    </Link>
  )
}


