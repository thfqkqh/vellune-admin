export type Inquiry = {
  rowIndex: number;
  id: string;
  date: string;
  type: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  privacy: string;
  status: InquiryStatus;
  notes: string;
};

export type InquiryStatus = "NEW" | "CHECKED" | "REPLIED" | "COMPLETED";

export const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "NEW", label: "신규 (NEW)" },
  { value: "CHECKED", label: "확인 (CHECKED)" },
  { value: "REPLIED", label: "답변 (REPLIED)" },
  { value: "COMPLETED", label: "완료 (COMPLETED)" },
];

export const STATUS_COLORS: Record<InquiryStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CHECKED: "bg-amber-100 text-amber-800",
  REPLIED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
};
