"use client";

import { useCallback, useEffect, useState } from "react";
import type { Inquiry, InquiryStatus } from "@/lib/types";
import { STATUS_OPTIONS } from "@/lib/types";
import { AiButton } from "@/components/AiButton";

type InquiryDetailProps = {
  inquiry: Inquiry;
  onUpdated: (inquiry: Inquiry) => void;
  aiTrigger?: string | null;
  onAiTriggered?: () => void;
};

export function InquiryDetail({
  inquiry,
  onUpdated,
  aiTrigger,
  onAiTriggered,
}: InquiryDetailProps) {
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [notes, setNotes] = useState(inquiry.notes);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus(inquiry.status);
    setNotes(inquiry.notes);
    setMessage("");
    setError("");
  }, [inquiry]);

  const handleAiSuggest = useCallback(async () => {
    setAiLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/ai/inquiry-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: inquiry.id,
          date: inquiry.date,
          type: inquiry.type,
          company: inquiry.company,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          message: inquiry.message,
          status,
          notes,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        suggestion?: string;
        error?: string;
      };

      if (!response.ok || !result.success || !result.suggestion) {
        throw new Error(result.error ?? "AI suggestion failed.");
      }

      setNotes(result.suggestion);
      setMessage("AI draft applied to notes. Review and save when ready.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI suggestion failed.");
    } finally {
      setAiLoading(false);
    }
  }, [inquiry, notes, status]);

  useEffect(() => {
    if (!aiTrigger || aiTrigger !== inquiry.id) return;

    void handleAiSuggest().finally(() => {
      onAiTriggered?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per aiTrigger
  }, [aiTrigger, inquiry.id]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/inquiries/${encodeURIComponent(inquiry.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        inquiry?: Inquiry;
        error?: string;
      };

      if (!response.ok || !result.success || !result.inquiry) {
        throw new Error(result.error ?? "Failed to save changes.");
      }

      onUpdated(result.inquiry);
      setMessage("Saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.2em] text-muted">INQUIRY DETAIL</p>
        <h2 className="mt-2 text-2xl font-medium">{inquiry.id}</h2>
        <p className="text-sm text-muted">{inquiry.date}</p>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <DetailItem label="Type" value={inquiry.type} />
        <DetailItem label="Company" value={inquiry.company || "-"} />
        <DetailItem label="Name" value={inquiry.name} />
        <DetailItem label="Email" value={inquiry.email} />
        <DetailItem label="Phone" value={inquiry.phone || "-"} />
        <DetailItem label="Privacy" value={inquiry.privacy} />
      </dl>

      <div>
        <p className="mb-2 text-sm font-medium">Message</p>
        <p className="rounded-md bg-black/[0.03] p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {inquiry.message}
        </p>
      </div>

      <div>
        <label htmlFor="status" className="mb-2 block text-sm font-medium">
          Status (J열)
        </label>
        <select
          id="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as InquiryStatus)}
          className="w-full rounded-md border border-black/10 px-4 py-3 text-sm outline-none focus:border-accent"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes / 비고 (K열)
          </label>
          <AiButton onClick={handleAiSuggest} loading={aiLoading} />
        </div>
        <textarea
          id="notes"
          rows={5}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="관리자 메모를 입력하세요."
          className="w-full resize-none rounded-md border border-black/10 px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-md bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:bg-accent disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-[0.15em] text-muted">{label}</dt>
      <dd className="mt-1 font-medium break-all">{value}</dd>
    </div>
  );
}
