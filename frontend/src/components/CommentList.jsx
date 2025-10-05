import '../styles/components/CommentList.css'

export default function CommentList({ comments }) {
  if (!comments?.length) {
    return <div className="comment-list-empty">No comments yet.</div>
  }
  return (
    <ul className="comment-list">
      {comments.map(c => (
        <li key={c.id} className="comment-item">
          <div className="comment-content">{c.content}</div>
          <div className="comment-author">by {c.author?.username}</div>
        </li>
      ))}
    </ul>
  )
}


