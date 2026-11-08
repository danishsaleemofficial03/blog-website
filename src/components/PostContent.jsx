import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// Extracts the video id from any common YouTube URL
export function getYouTubeId(url = "") {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

function YouTubeEmbed({ id }) {
  return (
    <div className="video">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title="YouTube video"
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default function PostContent({ markdown }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // A YouTube link sitting alone on its own line becomes an embedded player
          p({ node, children }) {
            const only = node.children.length === 1 ? node.children[0] : null;
            if (only?.tagName === "a") {
              const id = getYouTubeId(only.properties?.href);
              if (id) return <YouTubeEmbed id={id} />;
            }
            return <p>{children}</p>;
          },
          a({ href, children }) {
            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
          },
          img({ src, alt }) {
            return <img src={src} alt={alt || ""} loading="lazy" />;
          },
        }}
      >
        {markdown || ""}
      </ReactMarkdown>
    </div>
  );
}
