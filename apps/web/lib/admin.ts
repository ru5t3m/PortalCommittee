import { adminAuthFetch } from "@/lib/auth";
import { API_URL, parseApiError, type RegionOffice } from "@/lib/api";
import type { PsychologicalTestResult } from "@/lib/psychological-tests";

export type AdminDashboard = {
  actor: {
    id: number;
    email: string | null;
    full_name: string;
    role: "admin" | "moderator" | "candidate";
    telegram_username: string | null;
    phone: string | null;
    phone_verified: boolean;
  };
  users: number;
  appeals: number;
  candidates: number;
  region_offices: number;
  permissions: string[];
  candidate_status_counts: Record<string, number>;
};

export type AdminAppeal = {
  assigned_to_name?: string | null;
  organizational_unit_name_ru?: string | null;
  organizational_unit_name_kk?: string | null;
  organizational_unit_id: number | null;
  assigned_to_id: number | null;
  id: number;
  tracking_code: string;
  full_name: string;
  iin: string | null;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "received" | "in_review" | "answered" | "rejected";
  created_at: string;
  updated_at: string;
};

export type AdminCandidate = {
  assigned_to_name?: string | null;
  organizational_unit_name_ru?: string | null;
  organizational_unit_name_kk?: string | null;
  organizational_unit_id: number | null;
  assigned_to_id: number | null;
  id: number;
  tracking_code: string;
  status: "draft" | "submitted" | "in_review" | "approved" | "rejected";
  first_name: string;
  last_name: string;
  middle_name: string | null;
  iin: string | null;
  birth_date: string | null;
  phone: string;
  region: string | null;
  education_level: string | null;
  desired_direction: string | null;
  moderator_comment: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    email: string | null;
    full_name: string;
    role: "admin" | "moderator" | "candidate";
    telegram_username: string | null;
    phone: string | null;
    phone_verified: boolean;
  };
};

export type AdminPsychologicalTestResult = PsychologicalTestResult & {
  answer_key?: Record<string, { values: string[]; explanation: string }>;
  user: AdminDashboard["actor"];
  candidate_application: {
    tracking_code: string;
    status: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    phone: string;
    region: string | null;
    education_level: string | null;
    desired_direction: string | null;
  } | null;
  answers: Record<string, Record<string, string | string[]>>;
};

export type AdminRegionOffice = RegionOffice;
export type AdminRegionOfficePayload = Omit<RegionOffice, "id">;

async function readJson<T>(response: Response) {
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as T;
}

export async function getAdminDashboard() {
  return readJson<AdminDashboard>(await adminAuthFetch(`${API_URL}/admin/dashboard`));
}

export async function listAdminAppeals() {
  return readJson<AdminAppeal[]>(await adminAuthFetch(`${API_URL}/admin/appeals`));
}

export async function listAdminCandidates() {
  return readJson<AdminCandidate[]>(await adminAuthFetch(`${API_URL}/admin/candidates`));
}

export async function listAdminPsychologicalTestResults() {
  return readJson<AdminPsychologicalTestResult[]>(await adminAuthFetch(`${API_URL}/admin/psychological-tests/results`));
}

export async function listAdminRegionOffices() {
  return readJson<AdminRegionOffice[]>(await adminAuthFetch(`${API_URL}/admin/contacts/regions`));
}

export async function updateAdminAppealStatus(id: number, status: AdminAppeal["status"]) {
  return readJson<AdminAppeal>(
    await adminAuthFetch(`${API_URL}/admin/appeals/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
  );
}

export async function updateAdminCandidateStatus(id: number, status: AdminCandidate["status"], moderatorComment: string | null) {
  return readJson<AdminCandidate>(
    await adminAuthFetch(`${API_URL}/admin/candidates/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, moderator_comment: moderatorComment })
    })
  );
}

export async function createAdminRegionOffice(payload: AdminRegionOfficePayload) {
  return readJson<AdminRegionOffice>(
    await adminAuthFetch(`${API_URL}/admin/contacts/regions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  );
}

export async function updateAdminRegionOffice(id: number, payload: AdminRegionOfficePayload) {
  return readJson<AdminRegionOffice>(
    await adminAuthFetch(`${API_URL}/admin/contacts/regions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  );
}

export async function deleteAdminRegionOffice(id: number) {
  const response = await adminAuthFetch(`${API_URL}/admin/contacts/regions/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}

export type PageData<T> = { items: T[]; total: number; limit: number; offset: number };
export type Unit = { id: number; code: string; name_ru: string; name_kk: string };
export type StaffUser = AdminDashboard["actor"] & { staff_scope: "central" | "territorial" | null; organizational_unit_id: number | null; is_active: boolean; is_blocked: boolean };
export type Assignee = Pick<StaffUser, "id" | "full_name" | "staff_scope" | "organizational_unit_id">;
export type CaseComment = { id: number; author_name: string; visibility: "internal" | "candidate"; text: string; created_at: string };
export type CaseHistory = { id: number; actor_name: string | null; action: string; created_at: string; details: Record<string, unknown> | null };
export type QueryValues = Record<string, string | number | boolean | null | undefined>;

export async function adminPage<T>(path: string, values: QueryValues = {}, signal?: AbortSignal) {
  const params = new URLSearchParams({ paginated: "true" });
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") params.set(key, String(value)); });
  return readJson<PageData<T>>(await adminAuthFetch(`${API_URL}/admin/${path}?${params}`, { signal }));
}

export async function adminGet<T>(path: string, signal?: AbortSignal) {
  return readJson<T>(await adminAuthFetch(`${API_URL}/admin/${path}`, { signal }));
}

export async function adminWrite<T>(path: string, payload: unknown, method = "PATCH") {
  return readJson<T>(await adminAuthFetch(`${API_URL}/admin/${path}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
}
