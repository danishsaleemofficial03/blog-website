import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { formatDate } from "../utils";

export default function Admin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const snap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
    setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function togglePublish(p) {
    await updateDoc(doc(db, "posts", p.id), { published: !p.published });
    load();
  }
  async function remove(p) {
    if (!window.confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    await deleteDoc(doc(db, "posts", p.id));
    load();
  }

  return (
    <>
      <div className="row">
        <h1>Dashboard</h1>
        <Link to="/admin/new" className="btn">New post</Link>
      </div>

      {loading ? <p className="empty">Loading…</p> : posts.length === 0 ? (
        <p className="empty">No posts yet. Write your first one.</p>
      ) : (
        <table className="table">
          <thead><tr><th>Title</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td><Link to={`/post/${p.id}`}>{p.title}</Link></td>
                <td><span className={"badge " + (p.published ? "live" : "")}>{p.published ? "Published" : "Draft"}</span></td>
                <td>{formatDate(p.createdAt)}</td>
                <td className="actions">
                  <Link to={`/admin/edit/${p.id}`}>Edit</Link>
                  <button className="link-btn" onClick={() => togglePublish(p)}>{p.published ? "Unpublish" : "Publish"}</button>
                  <button className="link-btn danger" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
