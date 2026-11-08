export function formatDate(ts) {
  const date = ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : null;
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function readingTime(text = "") {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

export function makeExcerpt(md = "") {
  const plain = md
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[#>*_`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 160 ? plain.slice(0, 157) + "…" : plain;
}
