"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BoardPost } from "@/lib/types";
import { PostDetail } from "@/components/PostDetail";

export function BoardManager() {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/posts");
      const result = (await response.json()) as {
        success?: boolean;
        posts?: BoardPost[];
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to load posts.");
      }

      setPosts(result.posts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return posts;

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.authorEmail.toLowerCase().includes(keyword),
    );
  }, [posts, search]);

  const selectedPost =
    filteredPosts.find((item) => item.id === selectedId) ??
    filteredPosts[0] ??
    null;

  const handleDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((item) => item.id !== postId));
    setSelectedId(null);
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-xl border border-black/10 bg-white p-5">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, content, author..."
          className="mb-5 w-full rounded-md border border-black/10 px-4 py-2 text-sm outline-none focus:border-accent"
        />

        {loading && <p className="text-sm text-muted">Loading posts...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && filteredPosts.length === 0 && (
          <p className="text-sm text-muted">No board posts found.</p>
        )}

        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelectedId(post.id)}
              className={`w-full rounded-lg border p-4 text-left transition ${
                selectedPost?.id === post.id
                  ? "border-accent bg-accent/5"
                  : "border-black/10 hover:bg-black/[0.02]"
              }`}
            >
              <p className="font-medium">{post.title}</p>
              <p className="mt-1 text-sm text-muted">{post.authorEmail}</p>
              <p className="mt-3 line-clamp-2 text-sm text-muted">{post.content}</p>
              <p className="mt-2 text-xs text-muted">{post.createdAt}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5">
        {selectedPost ? (
          <PostDetail postId={selectedPost.id} onDeleted={handleDeleted} />
        ) : (
          <p className="text-sm text-muted">Select a post to manage replies.</p>
        )}
      </section>
    </main>
  );
}
