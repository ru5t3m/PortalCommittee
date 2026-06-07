export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type TrackingResponse = {
  tracking_code: string;
  status: string;
};

export type CitizenAppealPayload = {
  full_name: string;
  iin?: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export async function parseApiError(response: Response) {
  try {
    const payload = await response.json();
    if (typeof payload.detail === "string") return payload.detail;
    if (Array.isArray(payload.detail)) {
      return payload.detail
        .map((item: { msg?: string }) => item.msg)
        .filter(Boolean)
        .join(". ");
    }
    return "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function submitCitizenAppeal(payload: CitizenAppealPayload) {
  const response = await fetch(`${API_URL}/appeals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as TrackingResponse;
}

export async function getAppealStatus(trackingCode: string) {
  const response = await fetch(`${API_URL}/appeals/${encodeURIComponent(trackingCode)}`);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as TrackingResponse;
}
