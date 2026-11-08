import {confirmAction, notify} from '../../services/feedback';
import { useEffect, useState, useMemo } from "react";
import { checked } from "../../services/backend";
import { supabase } from "../../supabase";
import {
  MessageSquare,
  Pin,
  Trash2,
  PinOff,
  Calendar,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { paginate } from "../../utils/pagination";

const PAGE_SIZE = 10;

const Card = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>

    <div className="relative bg-white  border border-[#e0e5ed] rounded-xl h-full">
      {children}
    </div>
  </div>
);

export default function Comments() {
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchComments = async () => {
    setLoading(true); setError('');
    try {
      setComments(await checked(supabase.from('portfolio_comments').select('*').order('is_pinned',{ascending:false}).order('created_at',{ascending:false})) || []);
    } catch(error) { setError(error.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // Reset page when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const pin = async (id,value) => {
    try { await checked(supabase.from('portfolio_comments').update({is_pinned:value}).eq('id',id).select('id').single()); await fetchComments(); }
    catch(error) { setError(error.message); }
  };
  const remove = async (id) => {
    if (!await confirmAction('Delete this comment?')) return;
    try { await checked(supabase.from('portfolio_comments').delete().eq('id',id).select('id').single()); await fetchComments(); }
    catch(error) { setError(error.message); }
  };

  const pinnedCount = comments.filter((c) => c.is_pinned).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter + search
  const filtered = useMemo(() => {
    let result =
      filter === "pinned" ? comments.filter((c) => c.is_pinned) : comments;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          (c.user_name || "").toLowerCase().includes(q) ||
          (c.content || "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [comments, filter, search]);

  // Pagination
  const {page:currentPage,totalPages,items:paginated} = paginate(filtered,page,PAGE_SIZE);
  useEffect(() => { setPage(currentPage); }, [currentPage]);

  return (
    <div className="space-y-6">
      {error && <p role="alert" className="text-red-700 p-4">{error}</p>}
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">

            <div className="admin-page-icon">
              <MessageSquare className="w-4 h-4 text-[#315cbd]" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-medium text-[#17243b]">
              Comments
            </h1>
            <p className="text-[#68758a] text-xs">
              {comments.length} total · {pinnedCount} pinned
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white border border-[#e0e5ed]">
          {[
            { value: "all", label: "All", count: comments.length },
            { value: "pinned", label: "Pinned", count: pinnedCount },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm transition-colors duration-200 ${
                filter === tab.value
                  ? "bg-[#f0f3f8] border border-[#cdd6e3] text-[#17243b] font-medium"
                  : "text-[#68758a] hover:text-[#475569]"
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs ${
                  filter === tab.value
                    ? "bg-[#f0f3f8] text-[#315cbd]"
                    : "bg-[#f0f3f8] text-[#68758a]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: comments.length, color: "text-[#315cbd]" },
          { label: "Pinned", value: pinnedCount, color: "text-[#17243b]" },
          {
            label: "Unpinned",
            value: comments.length - pinnedCount,
            color: "text-[#17243b]",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="p-3 sm:p-4">
              <p className="text-[#68758a] text-xs mb-1">{stat.label}</p>
              <p className={`text-xl sm:text-2xl font-medium ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#68758a] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or message..."
          className="w-full bg-white border border-[#e0e5ed] rounded-xl pl-10 pr-10 py-2.5 text-[#334155] placeholder-gray-600 text-sm outline-none focus:border-[#cdd6e3] focus:ring-1 focus:ring-indigo-500/20 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68758a] hover:text-[#475569] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Result count when searching */}
      {search && (
        <p className="text-xs text-[#68758a] -mt-3">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "
          {search}"
        </p>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-[#e0e5ed] border-t-[#90baff] rounded-full animate-spin" />
        </div>
      ) : paginated.length === 0 ? (
        <Card>
          <div className="p-14 text-center">
            <MessageSquare className="w-10 h-10 text-[#68758a] mx-auto mb-3" />
            <p className="text-[#68758a] text-sm">
              {search
                ? "No comments match your search."
                : filter === "pinned"
                  ? "No pinned comments."
                  : "No comments yet."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginated.map((comment) => (
            <div key={comment.id} className="relative group">

              <div
                className={`relative bg-white  border rounded-xl px-4 py-4 sm:px-5 transition-colors duration-200 ${
                  comment.is_pinned
                    ? "border-[#cdd6e3]"
                    : "border-[#e0e5ed] hover:border-white/18"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f0f3f8] border border-[#e0e5ed] flex items-center justify-center shrink-0">
                    <img
                      src={comment.profile_image || "/default-avatar.jpg"}
                      alt="Avatar"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-[#17243b]">
                        {/* Highlight search match in name */}
                        {highlightMatch(
                          comment.user_name || "Anonymous",
                          search,
                        )}
                      </span>
                      {comment.is_pinned && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0f3f8] border border-[#cdd6e3] text-[#315cbd] text-xs">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[#68758a] text-xs ml-auto shrink-0">
                        <Calendar className="w-3 h-3" />
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-[#475569] text-sm leading-relaxed">
                      {/* Highlight search match in content */}
                      {highlightMatch(comment.content || "", search)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => pin(comment.id, !comment.is_pinned)}
                      title={comment.is_pinned ? "Unpin" : "Pin"}
                      className={`p-2 rounded-lg border transition-colors duration-200 ${
                        comment.is_pinned
                          ? "border-[#cdd6e3] bg-[#f0f3f8] text-[#315cbd] hover:bg-[#f0f3f8]"
                          : "border-[#e0e5ed] text-[#68758a] hover:text-[#315cbd] hover:border-[#cdd6e3]"
                      }`}
                    >
                      {comment.is_pinned ? (
                        <PinOff className="w-3.5 h-3.5" />
                      ) : (
                        <Pin className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => remove(comment.id)}
                      className="p-2 rounded-lg border border-[#e0e5ed] text-[#68758a] hover:text-red-700 hover:border-red-500/20 hover:bg-red-500/5 transition-colors duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-xs text-[#68758a]">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-[#e0e5ed] text-[#5c6980] hover:text-[#315cbd] hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && arr[i - 1] !== p - 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="px-2 text-[#68758a] text-xs"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs border transition-colors duration-200 ${
                      page === p
                        ? "bg-[#f0f3f8] border-[#cdd6e3] text-[#315cbd] font-medium"
                        : "border-[#e0e5ed] text-[#5c6980] hover:text-[#315cbd] hover:border-white/20"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-[#e0e5ed] text-[#5c6980] hover:text-[#315cbd] hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Highlight matching text
function highlightMatch(text, query) {
  if (!query.trim()) return text;
  const regex = new RegExp(
    `(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-[#f0f3f8] text-[#315cbd] rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
