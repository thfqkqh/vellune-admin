"use client";

import { useEffect, useState } from "react";
import type { BoardPost } from "@/lib/types";

type PostDetailProps = {
  postId: string;
  onDeleted: (postId: string) => void;
};

export function PostDetail({ postId, onDeleted }: PostDetailProps) {
  const [post, setPost] = useState<BoardPost | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const response = await fetch(`/api/posts/${encodeURIComponent(postId)}`);
        const result = (await response.json()) as {
          success?: boolean;
          post?: BoardPost;
          error?: string;
        };

        if (!response.ok || !result.success || !result.post) {
          throw new Error(result.error ?? "Failed to load post.");
        }

        if (!cancelled) {
          setPost(result.post);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load post.");
          setPost(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const handleReply = async () => {
    if (!post) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/posts/${encodeURIComponent(post.id)}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: reply }),
        },
      );

      const result = (await response.json()) as {
        success?: boolean;
        reply?: BoardPost["replies"][number];
        error?: string;
      };

      if (!response.ok || !result.success || !result.reply) {
        throw new Error(result.error ?? "Failed to post reply.");
      }

      setPost((current) =>
        current
          ? { ...current, replies: [...current.replies, result.reply!] }
          : current,
      );
      setReply("");
      setMessage("Reply posted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    const confirmed = window.confirm(
      "이 게시글을 삭제할까요? 답글도 함께 삭제됩니다.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(post.id)}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to delete post.");
      }

      onDeleted(post.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">Loading post...</p>;
  }

  if (error && !post) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!post) {
    return <p className="text-sm text-muted">Post not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted">BOARD POST</p>
          <h2 className="mt-2 text-2xl font-medium">{post.title}</h2>
          <p className="mt-1 text-sm text-muted">{post.authorEmail}</p>
          <p className="text-xs text-muted">{post.createdAt}</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete Post"}
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Content</p>
        <p className="rounded-md bg-black/[0.03] p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium">Replies ({post.replies.length})</p>
        {post.replies.length === 0 ? (
          <p className="text-sm text-muted">No replies yet.</p>
        ) : (
          <div className="space-y-3">
            {post.replies.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-accent/20 bg-accent/5 p-4"
              >
                <p className="text-xs tracking-[0.2em] text-accent">VELLUNE ADMIN</p>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
                <p className="mt-2 text-xs text-muted">{item.createdAt}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="admin-reply" className="mb-2 block text-sm font-medium">
          Admin Reply
        </label>
        <textarea
          id="admin-reply"
          rows={4}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Write an official reply..."
          className="w-full rounded-md border border-black/10 px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleReply}
          disabled={saving || !reply.trim()}
          className="mt-3 rounded-md bg-foreground px-4 py-2 text-sm text-background transition hover:bg-accent disabled:opacity-60"
        >
          {saving ? "Posting..." : "Post Reply"}
        </button>
      </div>

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
