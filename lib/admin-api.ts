import type { Inquiry, InquiryStatus } from "./types";

type ApiResponse<T> = {
  success: boolean;
  error?: string;
} & T;

function getScriptUrl() {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) {
    throw new Error("GOOGLE_SCRIPT_URL is not configured.");
  }
  return url;
}

function getAdminSecret() {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) {
    throw new Error("ADMIN_API_SECRET is not configured.");
  }
  return secret;
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  const url = new URL(getScriptUrl());
  url.searchParams.set("action", "list");
  url.searchParams.set("secret", getAdminSecret());

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch inquiries.");
  }

  const result = (await response.json()) as ApiResponse<{ inquiries: Inquiry[] }>;
  if (!result.success) {
    throw new Error(result.error ?? "Failed to fetch inquiries.");
  }

  return result.inquiries ?? [];
}

export async function updateInquiry(
  id: string,
  data: { status?: InquiryStatus; notes?: string },
): Promise<Inquiry> {
  const response = await fetch(getScriptUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "update",
      secret: getAdminSecret(),
      id,
      status: data.status,
      notes: data.notes,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to update inquiry.");
  }

  const result = (await response.json()) as ApiResponse<{ inquiry: Inquiry }>;
  if (!result.success || !result.inquiry) {
    throw new Error(result.error ?? "Failed to update inquiry.");
  }

  return result.inquiry;
}
