import { EDGE_FUNCTION_URL, authHeaders, type Profile, type Questions, type ChatMessage } from "./supabase";

async function postJson(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${EDGE_FUNCTION_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function extractProfile(resume_text: string, job_description?: string): Promise<Profile> {
  const d = await postJson("/extract", { resume_text, job_description });
  return d.profile as Profile;
}

export async function generateQuestions(profile: Profile, job_description?: string): Promise<Questions> {
  const d = await postJson("/generate-questions", { profile, job_description });
  return d.questions as Questions;
}

export type StreamHandlers = {
  onStart?: () => void;
  onToken: (chunk: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
};

export async function streamInterview(
  profile: Profile,
  questions: Questions,
  history: ChatMessage[],
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${EDGE_FUNCTION_URL}/interview/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ profile, questions, messages: history }),
    signal,
  });

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    handlers.onError?.(data.error || `Stream failed (${res.status})`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      for (const evt of events) {
        const lines = evt.split("\n");
        let event = "message";
        let dataLine = "";
        for (const l of lines) {
          if (l.startsWith("event:")) event = l.slice(6).trim();
          else if (l.startsWith("data:")) dataLine = l.slice(5).trim();
        }
        if (!dataLine) continue;
        let payload: { content?: string } = {};
        try {
          payload = JSON.parse(dataLine);
        } catch {
          continue;
        }
        if (event === "start") handlers.onStart?.();
        else if (event === "token") handlers.onToken(payload.content || "");
        else if (event === "error") handlers.onError?.(payload.content || "Unknown error");
        else if (event === "done") handlers.onDone?.();
      }
    }
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      handlers.onError?.(String((err as Error).message || err));
    }
  }
}
