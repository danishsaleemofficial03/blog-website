import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import PostContent from "../components/PostContent";
import Comments from "../components/Comments";
import { formatDate, readingTime } from "../utils";
import { samplePosts } from "../data/samplePosts";

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(undefined);

  useEffect(() => {
    const sample = samplePosts.find((item) => item.id === id);
    if (sample) {
      setPost(sample);
      return;
    }

    let active = true;
    getDoc(doc(db, "posts", id))
      .then((s) => {
        if (active) setPost(s.exists() ? { id: s.id, ...s.data() } : samplePosts.find((sample) => sample.id === id) || null);
      })
      .catch(() => {
        if (active) setPost(samplePosts.find((sample) => sample.id === id) || null);
      });
    return () => { active = false; };
  }, [id]);

  if (post === undefined) return <p className="empty">Loading…</p>;
  if (post === null) return <p className="empty">This post doesn't exist or isn't published.</p>;

  return (
    <article className="article">
      <Link to="/" className="back">← All posts</Link>
      <h1>{post.title}</h1>
      <div className="meta">
        {post.authorName || "Guest author"} · {formatDate(post.createdAt)} · {readingTime(post.content)} min read
      </div>
      {post.coverImage && <img className="cover" src={post.coverImage} alt="" />}
      <PostContent markdown={post.content} />
      <Comments postId={post.id} />
    </article>
  );
}
