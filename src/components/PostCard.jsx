import { Link } from "react-router-dom";
import { formatDate, readingTime } from "../utils";

export default function PostCard({ post }) {
  return (
    <article className="card">
      {post.coverImage && (
        <Link to={`/post/${post.id}`} className="card-img">
          <img src={post.coverImage} alt="" loading="lazy" />
        </Link>
      )}
      <div className="card-body">
        <div className="meta">
          {post.isSample && <span className="sample-label">Sample</span>}
          {formatDate(post.createdAt)} · {readingTime(post.content)} min read
        </div>
        <h2><Link to={`/post/${post.id}`}>{post.title}</Link></h2>
        <p>{post.excerpt}</p>
        {post.tags?.length > 0 && (
          <div className="tags">
            {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </div>
    </article>
  );
}
