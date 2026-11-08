import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import PostContent, { getYouTubeId } from "../components/PostContent";
import { makeExcerpt } from "../utils";

export default function Editor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const ta = useRef(null);

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "posts", id)).then((s) => {
      if (!s.exists()) return;
      const d = s.data();
      setTitle(d.title); setCoverImage(d.coverImage || "");
      setTags((d.tags || []).join(", ")); setContent(d.content);
    });
  }, [id]);

  // Insert markdown around the current selection
  function wrap(before, after = "", placeholder = "text") {
    const el = ta.current;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = content.slice(s, e) || placeholder;
    const next = content.slice(0, s) + before + sel + after + content.slice(e);
    setContent(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + sel.length); });
  }

  function insertBlock(md) {
    const el = ta.current;
    const s = el.selectionStart;
    setContent(content.slice(0, s) + "\n\n" + md + "\n\n" + content.slice(el.selectionEnd));
    el.focus();
  }

  function addYouTube() {
    const url = window.prompt("Paste a YouTube link");
    if (!url) return;
    if (!getYouTubeId(url)) return alert("That doesn't look like a YouTube link.");
    insertBlock(url.trim());
  }
  function addImage() {
    const url = window.prompt("Paste an image URL");
    if (url) insertBlock(`![image description](${url.trim()})`);
  }
  function addLink() {
    const url = window.prompt("Link URL");
    if (url) wrap("[", `](${url})`, "link text");
  }

  async function save(published) {
    if (!title.trim() || !content.trim()) { setError("Add a title and some content first."); return; }
    setSaving(true); setError("");
    const data = {
      title: title.trim(),
      content,
      excerpt: makeExcerpt(content),
      coverImage: coverImage.trim(),
      tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      published,
      updatedAt: serverTimestamp(),
    };
    try {
      if (id) await updateDoc(doc(db, "posts", id), data);
      else await addDoc(collection(db, "posts"), {
        ...data, createdAt: serverTimestamp(), authorName: user.displayName || "Admin", authorUid: user.uid,
      });
      navigate("/admin");
    } catch (e) { setError(e.message); setSaving(false); }
  }

  return (
    <>
      <h1>{id ? "Edit post" : "New post"}</h1>
      <input className="title-input" placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="two">
        <input placeholder="Cover image URL (optional)" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
        <input placeholder="Tags, separated by commas" value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>

      <div className="toolbar-md">
        <button type="button" onClick={() => wrap("## ", "", "Heading")}>H2</button>
        <button type="button" onClick={() => wrap("**", "**")}><b>B</b></button>
        <button type="button" onClick={() => wrap("*", "*")}><i>I</i></button>
        <button type="button" onClick={() => wrap("`", "`", "code")}>Code</button>
        <button type="button" onClick={() => insertBlock("```js\n// your code\n```")}>Code block</button>
        <button type="button" onClick={() => wrap("> ", "", "quote")}>Quote</button>
        <button type="button" onClick={() => wrap("- ", "", "list item")}>List</button>
        <button type="button" onClick={addLink}>Link</button>
        <button type="button" onClick={addImage}>Image</button>
        <button type="button" onClick={addYouTube}>YouTube</button>
      </div>

      <div className="editor">
        <textarea ref={ta} value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Write in Markdown. A YouTube link on its own line becomes a video player." />
        <div className="preview"><PostContent markdown={content || "*Preview appears here*"} /></div>
      </div>

      {error && <p className="error">{error}</p>}
      <div className="row">
        <button className="btn btn-outline" disabled={saving} onClick={() => save(false)}>Save draft</button>
        <button className="btn" disabled={saving} onClick={() => save(true)}>Publish</button>
      </div>
    </>
  );
}
