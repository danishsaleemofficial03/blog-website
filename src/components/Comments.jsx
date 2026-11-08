import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { formatDate } from "../utils";

export default function Comments({ postId }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) =>
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [postId]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, "posts", postId, "comments"), {
      text: text.trim(),
      uid: user.uid,
      name: user.displayName || user.email.split("@")[0],
      createdAt: serverTimestamp(),
    });
    setText("");
  }

  return (
    <section className="comments">
      <h3>Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={submit} className="comment-form">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment"
            maxLength={1000}
            rows={3}
          />
          <button className="btn" disabled={!text.trim()}>Post comment</button>
        </form>
      ) : (
        <p className="muted"><Link to="/login">Log in</Link> to join the discussion.</p>
      )}

      {comments.map((c) => (
        <div key={c.id} className="comment">
          <div className="meta">
            <strong>{c.name}</strong> · {formatDate(c.createdAt)}
            {user && (c.uid === user.uid || isAdmin) && (
              <button
                className="link-btn"
                onClick={() => deleteDoc(doc(db, "posts", postId, "comments", c.id))}
              >
                Delete
              </button>
            )}
          </div>
          <p>{c.text}</p>
        </div>
      ))}
    </section>
  );
}
