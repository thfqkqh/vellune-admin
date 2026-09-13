"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Inquiry, InquiryStatus } from "@/lib/types";
import { STATUS_COLORS, STATUS_OPTIONS } from "@/lib/types";
import { InquiryDetail } from "@/components/InquiryDetail";
import { BoardManager } from "@/components/BoardManager";

type AdminTab = "inquiries" | "board";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("inquiries");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/inquiries");
      const result = (await response.json()) as {
        success?: boolean;
        inquiries?: Inquiry[];
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to load inquiries.");
      }

      setInquiries(result.inquiries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      const matchesStatus =
        statusFilter === "ALL" || inquiry.status === statusFilter;
      const keyword = search.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        inquiry.id.toLowerCase().includes(keyword) ||
        inquiry.name.toLowerCase().includes(keyword) ||
        inquiry.email.toLowerCase().includes(keyword) ||
        inquiry.company.toLowerCase().includes(keyword) ||
        inquiry.message.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [inquiries, search, statusFilter]);

  const selectedInquiry =
    filteredInquiries.find((item) => item.id === selectedId) ??
    filteredInquiries[0] ??
    null;

  const handleUpdated = (updated: Inquiry) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs tracking-[0.35em] text-muted">VELLUNE ADMIN</p>
            <h1 className="text-xl font-medium">Admin Console</h1>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "inquiries" && (
              <button
                type="button"
                onClick={loadInquiries}
                className="rounded-md border border-black/10 px-4 py-2 text-sm transition hover:bg-black/5"
              >
                Refresh
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition hover:bg-accent"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-2 px-6 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            className={`rounded-md px-4 py-2 text-sm transition ${
              activeTab === "inquiries"
                ? "bg-foreground text-background"
                : "border border-black/10 hover:bg-black/5"
            }`}
          >
            Inquiries
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("board")}
            className={`rounded-md px-4 py-2 text-sm transition ${
              activeTab === "board"
                ? "bg-foreground text-background"
                : "border border-black/10 hover:bg-black/5"
            }`}
          >
            Board
          </button>
        </div>
      </header>

      {activeTab === "board" ? (
        <BoardManager />
      ) : (
      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-black/10 bg-white p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, ID, message..."
              className="flex-1 rounded-md border border-black/10 px-4 py-2 text-sm outline-none focus:border-accent"
            />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as InquiryStatus | "ALL")
              }
              className="rounded-md border border-black/10 px-4 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="ALL">All Status</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="text-sm text-muted">Loading inquiries...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && filteredInquiries.length === 0 && (
            <p className="text-sm text-muted">No inquiries found.</p>
          )}

          <div className="space-y-3">
            {filteredInquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                type="button"
                onClick={() => setSelectedId(inquiry.id)}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  selectedInquiry?.id === inquiry.id
                    ? "border-accent bg-accent/5"
                    : "border-black/10 hover:bg-black/[0.02]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-[0.2em] text-muted">{inquiry.id}</p>
                    <p className="mt-1 font-medium">{inquiry.name}</p>
                    <p className="text-sm text-muted">{inquiry.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[inquiry.status]}`}
                  >
                    {inquiry.status}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted">{inquiry.message}</p>
                <p className="mt-2 text-xs text-muted">{inquiry.date}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-black/10 bg-white p-5">
          {selectedInquiry ? (
            <InquiryDetail inquiry={selectedInquiry} onUpdated={handleUpdated} />
          ) : (
            <p className="text-sm text-muted">Select an inquiry to view details.</p>
          )}
        </section>
      </main>
      )}
    </div>
  );
}
