import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import PostCard from "../components/PostCard";
import { samplePosts } from "../data/samplePosts";
import { formatDate, readingTime } from "../utils";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState(samplePosts);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadPosts() {
      try {
        const q = query(collection(db, "posts"), where("published", "==", true));
        const snap = await getDocs(q);
        const publishedPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (active) setPosts([...samplePosts, ...publishedPosts]);
      } catch (error) {
        if (active) setLoadError(`Unable to load Firebase posts: ${error.message}`);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPosts();
    return () => { active = false; };
  }, []);

  const allTags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags || []))], [posts]);

  const filtered = posts
    .filter((p) => {
    const matchesSearch = (p.title + " " + p.excerpt + " " + p.content).toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || p.tags?.includes(activeTag);
    return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      const getDate = (post) => post.createdAt?.toDate?.().getTime() ?? post.createdAt?.getTime() ?? 0;
      return getDate(b) - getDate(a);
    });
  const featured = filtered[0];
  const remaining = filtered.slice(1);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">A publication for curious builders</p>
        <h1>Notes on building things for the web</h1>
        <p>Thoughtful write-ups, practical tutorials, and experiments from the workbench.</p>
        <div className="hero-meta">
          <span>{posts.length} stories</span>
          <span>{allTags.length} topics</span>
          <span>Fresh ideas, occasionally</span>
        </div>
      </section>

      <div className="toolbar">
        <label className="search-label">
          <span className="sr-only">Search stories</span>
          <input
            type="search"
            placeholder="Search stories, topics, or ideas"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="tags">
          <button
            className={"tag tag-btn" + (!activeTag ? " active" : "")}
            onClick={() => setActiveTag(null)}
          >
            All topics
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              className={"tag tag-btn" + (activeTag === t ? " active" : "")}
              onClick={() => setActiveTag(activeTag === t ? null : t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loadError && <p className="notice" role="status">{loadError}</p>}

      {loading && posts.length === 0 ? (
        <p className="empty">Loading posts…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p className="eyebrow">Nothing here yet</p>
          <h2>No stories match that search.</h2>
          <p className="muted">Try another phrase or clear your topic filter.</p>
          <button className="btn btn-outline" onClick={() => { setSearch(""); setActiveTag(null); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {featured && (
            <section className="featured-section" aria-label="Featured story">
              <div className="section-heading">
                <h2>Featured story</h2>
                <span className="muted">{filtered.length} {filtered.length === 1 ? "result" : "results"}</span>
              </div>
              <article className="featured-card">
                <Link to={`/post/${featured.id}`} className="featured-image">
                  <img src={featured.coverImage} alt="" />
                </Link>
                <div className="featured-copy">
                  <div className="meta">
                    {featured.isSample && <span className="sample-label">Sample story</span>}
                    {featured.tags?.[0] && <span>{featured.tags[0]}</span>}
                  </div>
                  <h2><Link to={`/post/${featured.id}`}>{featured.title}</Link></h2>
                  <p>{featured.excerpt}</p>
                  <div className="featured-footer">
                    <span className="meta">{featured.authorName || "Guest author"} · {formatDate(featured.createdAt)}</span>
                    <span className="meta">{readingTime(featured.content)} min read</span>
                  </div>
                  <Link to={`/post/${featured.id}`} className="read-link">Read story <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            </section>
          )}
          {remaining.length > 0 && (
            <section className="stories-section" aria-label="More stories">
              <div className="section-heading">
                <h2>{search || activeTag ? "More matching stories" : "More to explore"}</h2>
              </div>
              <div className="grid">{remaining.map((p) => <PostCard key={p.id} post={p} />)}</div>
            </section>
          )}
        </>
      )}
    </>
  );
}
