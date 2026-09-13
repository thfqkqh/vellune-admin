import type { BoardPost, PostReply } from "./types";
import { createSupabaseAdmin } from "./supabase/server";

type PostRow = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type ReplyRow = {
  id: string;
  post_id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", { hour12: false });
}

async function getAuthorEmail(userId: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return "unknown";
  }

  return data.user.email ?? "unknown";
}

function mapReply(row: ReplyRow): PostReply {
  return {
    id: row.id,
    postId: row.post_id,
    content: row.content,
    isAdmin: row.is_admin,
    createdAt: formatDate(row.created_at),
  };
}

export async function fetchPosts(): Promise<BoardPost[]> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as PostRow[];

  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      authorEmail: await getAuthorEmail(row.user_id),
      createdAt: formatDate(row.created_at),
      replies: [],
    })),
  );
}

export async function fetchPost(id: string): Promise<BoardPost | null> {
  const supabase = createSupabaseAdmin();

  const { data: postRow, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (postError) {
    throw new Error(postError.message);
  }

  if (!postRow) {
    return null;
  }

  const row = postRow as PostRow;

  const { data: replyRows, error: replyError } = await supabase
    .from("post_replies")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  if (replyError) {
    throw new Error(replyError.message);
  }

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    authorEmail: await getAuthorEmail(row.user_id),
    createdAt: formatDate(row.created_at),
    replies: ((replyRows ?? []) as ReplyRow[]).map(mapReply),
  };
}

export async function deletePost(id: string) {
  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createAdminReply(
  postId: string,
  content: string,
): Promise<PostReply> {
  const supabase = createSupabaseAdmin();
  const trimmed = content.trim();

  if (!trimmed) {
    throw new Error("Reply content is required.");
  }

  const { data, error } = await supabase
    .from("post_replies")
    .insert({
      post_id: postId,
      content: trimmed,
      is_admin: true,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create reply.");
  }

  return mapReply(data as ReplyRow);
}
