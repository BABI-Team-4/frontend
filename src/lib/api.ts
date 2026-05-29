const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const PREFIX = "/api/v1";

function url(path: string) {
  return `${API_BASE}${PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}

/* ─── Token helpers ─── */

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

/* ─── Base fetch with auth ─── */

async function apiFetch<T = unknown>(
  path: string,
  opts: RequestInit = {},
): Promise<{ success: boolean; data: T; message?: string; error?: { code: string; message: string } }> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url(path), { ...opts, headers });

  // Try refresh on 401
  if (res.status === 401 && getRefreshToken()) {
    const refreshRes = await fetch(url("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: getRefreshToken() }),
    });
    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      if (refreshData.success) {
        localStorage.setItem("access_token", refreshData.data.access_token);
        headers["Authorization"] = `Bearer ${refreshData.data.access_token}`;
        const retryRes = await fetch(url(path), { ...opts, headers });
        return retryRes.json();
      }
    }
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired");
  }

  return res.json();
}

/* ─── Auth ─── */

export const auth = {
  getOAuthUrl: (provider: string, redirectUri: string) =>
    apiFetch<{ provider: string; authorization_url: string; state: string }>(
      `/auth/oauth/${provider}/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`,
    ),

  oauthCallback: (provider: string, code: string, state: string, redirectUri: string) =>
    apiFetch<{ access_token: string; refresh_token: string; user: UserData }>(
      `/auth/oauth/${provider}/callback`,
      { method: "POST", body: JSON.stringify({ code, state, redirect_uri: redirectUri }) },
    ),

  refresh: (refreshToken: string) =>
    apiFetch<{ access_token: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: (refreshToken: string) =>
    apiFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  devLogin: (email: string) =>
    apiFetch<{ access_token: string; refresh_token: string; user: UserData }>(
      "/auth/dev-login",
      { method: "POST", body: JSON.stringify({ email }) },
    ),
};

/* ─── Users ─── */

export interface UserData {
  user_id: string;
  email: string;
  name: string;
  profile_image_url: string;
  auth_provider: string;
  role: string;
  plan: string;
  created_at?: string;
}

export interface UsageData {
  plan: string;
  monthly_analysis_limit: number;
  monthly_analysis_used: number;
  monthly_recommendation_limit: number;
  monthly_recommendation_used: number;
  reset_at: string;
}

export const users = {
  me: () => apiFetch<UserData>("/users/me"),
  update: (data: { name?: string }) =>
    apiFetch("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  usage: () => apiFetch<UsageData>("/users/me/usage"),
};

/* ─── Companies / Industries ─── */

export const companies = {
  industries: () => apiFetch<{ industry_id: number; name: string; description: string }[]>("/industries"),
  jobRoles: (industryId?: number) =>
    apiFetch(`/job-roles${industryId ? `?industry_id=${industryId}` : ""}`),
  list: (params?: { industry_id?: number; keyword?: string; page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.industry_id) sp.set("industry_id", String(params.industry_id));
    if (params?.keyword) sp.set("keyword", params.keyword);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    return apiFetch(`/companies?${sp}`);
  },
  get: (id: number) => apiFetch(`/companies/${id}`),
  jobPostings: (companyId: number, jobRoleId?: number) =>
    apiFetch(`/companies/${companyId}/job-postings${jobRoleId ? `?job_role_id=${jobRoleId}` : ""}`),
};

/* ─── Chat ─── */

export interface ChatSession {
  session_id: string;
  title: string;
  status: string;
  last_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatContext {
  target_company_id: number | null;
  target_company_name?: string;
  target_job_role_id: number | null;
  target_job_role_name?: string;
  job_posting_id: number | null;
  essay_question: string | null;
  essay_answer: string | null;
  ready_for_analysis: boolean;
}

export interface ChatMessage {
  message_id: number;
  role: string;
  content: string;
  message_type: string;
  required_fields?: string[];
  actions?: { type: string; label: string }[];
  created_at?: string;
}

export const chat = {
  createSession: (initialMessage = "") =>
    apiFetch<{ session_id: string; status: string; assistant_message: ChatMessage; context: ChatContext }>(
      "/chat/sessions",
      { method: "POST", body: JSON.stringify({ initial_message: initialMessage }) },
    ),

  listSessions: (page = 1, limit = 20) =>
    apiFetch<{ items: ChatSession[]; page: number; limit: number; total: number }>(
      `/chat/sessions?page=${page}&limit=${limit}`,
    ),

  getSession: (sessionId: string) =>
    apiFetch<{ session_id: string; title: string; status: string; context: ChatContext; messages: ChatMessage[] }>(
      `/chat/sessions/${sessionId}`,
    ),

  sendMessage: (sessionId: string, content: string, messageType = "text") =>
    apiFetch<{ user_message: ChatMessage; assistant_message: ChatMessage; context: ChatContext }>(
      `/chat/sessions/${sessionId}/messages`,
      { method: "POST", body: JSON.stringify({ content, message_type: messageType }) },
    ),

  submitEssay: (sessionId: string, essayQuestion: string, essayAnswer: string) =>
    apiFetch(`/chat/sessions/${sessionId}/essay`, {
      method: "POST",
      body: JSON.stringify({ essay_question: essayQuestion, essay_answer: essayAnswer }),
    }),

  updateContext: (sessionId: string, data: { target_company_id?: number; target_job_role_id?: number; job_posting_id?: number }) =>
    apiFetch(`/chat/sessions/${sessionId}/context`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  closeSession: (sessionId: string) =>
    apiFetch(`/chat/sessions/${sessionId}/close`, { method: "PATCH" }),
};

/* ─── Analysis ─── */

export interface AnalysisResult {
  analysis_id: string;
  session_id: string;
  target_company: { company_id: number; name: string };
  target_job_role: { job_role_id: number; name: string };
  scores: {
    overall_fit: number;
    talent_fit: number;
    jd_keyword_fit: number;
    accepted_cover_letter_similarity: number;
    specificity: number;
  };
  summary: { strength: string; weakness: string; strategy: string };
  keyword_analysis: {
    detected_keywords: string[];
    matched_keywords: string[];
    missing_keywords: string[];
    recommended_keywords: string[];
  };
  essay_feedback: {
    score: number;
    feedback: string;
    recommended_direction: string;
    risk_points: string[];
  };
  similar_accepted_cases: {
    accepted_cover_letter_id: number;
    company_name: string;
    job_role_name: string;
    similarity: number;
    common_keywords: string[];
  }[];
}

export const analysis = {
  create: (sessionId: string, analysisType = "full") =>
    apiFetch<{ analysis_id: string; session_id: string; status: string }>(
      `/chat/sessions/${sessionId}/analysis`,
      { method: "POST", body: JSON.stringify({ analysis_type: analysisType }) },
    ),

  getStatus: (analysisId: string) =>
    apiFetch<{ analysis_id: string; status: string; progress: number; current_step: string }>(
      `/analyses/${analysisId}`,
    ),

  getResult: (analysisId: string) =>
    apiFetch<AnalysisResult>(`/analyses/${analysisId}/result`),

  sendToChat: (analysisId: string) =>
    apiFetch(`/analyses/${analysisId}/send-to-chat`, { method: "POST" }),
};

/* ─── Recommendations ─── */

export const recommendations = {
  create: (sessionId: string, limit = 10) =>
    apiFetch(`/chat/sessions/${sessionId}/recommendations`, {
      method: "POST",
      body: JSON.stringify({ limit }),
    }),

  get: (recommendationId: string) =>
    apiFetch(`/recommendations/${recommendationId}`),
};

/* ─── Plans ─── */

export const plans = {
  list: () => apiFetch("/plans"),
};
