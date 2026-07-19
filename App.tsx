import { useEffect, useRef, useState } from "react";
import {
  Sparkles, FileText, Briefcase, Wand2, ArrowRight, Loader2,
  MessageSquare, Send, User, Bot, AlertCircle,
  RotateCcw, ListChecks, Target, Zap, Clock, TrendingUp, X,
} from "lucide-react";
import {
  supabase, getOwnerToken, authHeaders,
  type Profile, type Questions, type ChatMessage, type Session,
} from "./lib/supabase";
import { extractProfile, generateQuestions, streamInterview } from "./lib/ai";

type Stage = "input" | "preparing" | "ready" | "interview";

export default function App() {
  const [stage, setStage] = useState<Stage>("input");
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [questions, setQuestions] = useState<Questions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState("");
  const [input, setInput] = useState("");
  const [openaiReady, setOpenaiReady] = useState<boolean | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kairos-ai/health`)
      .then((r) => r.json())
      .then((d) => setOpenaiReady(!!d.openai_configured))
      .catch(() => setOpenaiReady(false));
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [history, partial]);

  async function handleAnalyze() {
    if (!resume.trim()) {
      setError("Paste your resume text to begin.");
      return;
    }
    setError(null);
    setStage("preparing");
    try {
      const prof = await extractProfile(resume.trim(), jobDescription.trim() || undefined);
      setProfile(prof);
      const qs = await generateQuestions(prof, jobDescription.trim() || undefined);
      setQuestions(qs);

      const { data } = await supabase
        .from("interview_sessions")
        .insert({
          owner_token: getOwnerToken(),
          title: prof.summary?.slice(0, 80) || "Untitled session",
          resume_text: resume.trim(),
          job_description: jobDescription.trim() || null,
          profile: prof,
          questions: qs,
          status: "ready",
        })
        .select("id")
        .single();
      if (data) setSessionId(data.id);

      setStage("ready");
    } catch (e) {
      setError(String((e as Error).message || e));
      setStage("input");
    }
  }

  async function startInterview() {
    if (!profile || !questions) return;
    setStage("interview");
    setHistory([]);
    await runStream([
      { role: "user", content: "Let's begin the interview. Please introduce yourself and ask your first question." },
    ]);
  }

  async function runStream(convo: ChatMessage[]) {
    if (!profile || !questions) return;
    setStreaming(true);
    setPartial("");
    let acc = "";
    await streamInterview(profile, questions, convo, {
      onStart: () => setStreaming(true),
      onToken: (c) => {
        acc += c;
        setPartial(acc);
      },
      onDone: () => {
        setHistory((h) => [...h, { role: "assistant", content: acc }]);
        setPartial("");
        setStreaming(false);
      },
      onError: (m) => {
        setError(m);
        setStreaming(false);
        setPartial("");
      },
    });
  }

  async function sendAnswer() {
    if (!input.trim() || streaming) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const next = [...history, userMsg];
    setHistory(next);
    setInput("");
    await runStream(next);
  }

  function reset() {
    setStage("input");
    setResume("");
    setJobDescription("");
    setProfile(null);
    setQuestions(null);
    setHistory([]);
    setPartial("");
    setError(null);
    setSessionId(null);
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundFX />
      <div className="relative z-10">
        <Header openaiReady={openaiReady} />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
          {stage === "input" && (
            <InputStage resume={resume} setResume={setResume}
              jobDescription={jobDescription} setJobDescription={setJobDescription}
              onAnalyze={handleAnalyze} openaiReady={openaiReady} />
          )}
          {stage === "preparing" && <PreparingStage />}
          {stage === "ready" && profile && questions && (
            <ReadyStage profile={profile} questions={questions}
              onStart={startInterview} onBack={reset} />
          )}
          {stage === "interview" && profile && questions && (
            <InterviewStage history={history} partial={partial} streaming={streaming}
              input={input} setInput={setInput} onSend={sendAnswer}
              onReset={reset} chatRef={chatRef} profile={profile} questions={questions} />
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function BackgroundFX() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-gold-500/10 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] rounded-full bg-sage-700/10 blur-[140px]" />
      <div className="absolute top-1/3 left-1/2 w-[28rem] h-[28rem] rounded-full bg-gold-400/5 blur-[100px]" />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
    </div>
  );
}

function Header({ openaiReady }: { openaiReady: boolean | null }) {
  return (
    <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-ink-950" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="font-display text-2xl leading-none text-ink-50">Kairós</h1>
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400 mt-0.5">The Opportune Interview Simulator</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <StatusPill ok={openaiReady} />
        </div>
      </div>
    </header>
  );
}

function StatusPill({ ok }: { ok: boolean | null }) {
  if (ok === null) return null;
  return (
    <div className={`chip ${ok ? "border-sage-600/40 text-sage-300 bg-sage-900/30" : "border-gold-600/40 text-gold-300 bg-gold-900/20"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-sage-400" : "bg-gold-400"} animate-pulseDot`} />
      {ok ? "AI ready" : "Add OPENAI_API_KEY"}
    </div>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-950/30 px-4 py-3 flex items-start gap-3 animate-fadeUp">
      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <p className="text-sm text-red-200 flex-1">{message}</p>
      <button onClick={onDismiss} className="text-red-300 hover:text-red-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

function InputStage({ resume, setResume, jobDescription, setJobDescription, onAnalyze, openaiReady }: {
  resume: string; setResume: (s: string) => void;
  jobDescription: string; setJobDescription: (s: string) => void;
  onAnalyze: () => void; openaiReady: boolean | null;
}) {
  return (
    <div className="animate-fadeUp">
      <Hero />
      <div className="grid lg:grid-cols-2 gap-5 mt-10">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-gold-400" />
            <span className="field-label">Your Resume</span>
          </div>
          <textarea
            className="input-area min-h-[280px] font-mono text-sm leading-relaxed"
            placeholder="Paste your full resume text here — experience, skills, education, projects..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
          <div className="flex items-center justify-between mt-2 text-xs text-ink-500">
            <span>{resume.trim() ? `${resume.trim().length} chars` : "Required"}</span>
            <span>Plain text only</span>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-gold-400" />
            <span className="field-label">Target Job Description <span className="text-ink-600 normal-case tracking-normal">(optional)</span></span>
          </div>
          <textarea
            className="input-area min-h-[280px] text-sm leading-relaxed"
            placeholder="Paste the job description you're targeting. Kairós will spot skill gaps and tailor questions to it."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="flex items-center justify-between mt-2 text-xs text-ink-500">
            <span>{jobDescription.trim() ? `${jobDescription.trim().length} chars` : "Optional"}</span>
            <span>Improves question targeting</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-1">
        <p className="text-sm text-ink-400 max-w-md">
          Kairós extracts your skills, predicts the hard questions, and runs a live mock interview with real-time feedback.
        </p>
        <button className="btn-primary w-full sm:w-auto" onClick={onAnalyze} disabled={!resume.trim()}>
          <Wand2 className="w-4 h-4" />
          Analyze & Prepare
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      {openaiReady === false && (
        <p className="mt-4 text-xs text-gold-300/80 px-1">
          Note: the AI isn't configured yet. Add an <code className="font-mono text-gold-200">OPENAI_API_KEY</code> secret in
          Supabase Edge Functions &gt; Secrets to enable analysis.
        </p>
      )}
    </div>
  );
}

function Hero() {
  return (
    <div className="text-center pt-6 pb-2">
      <div className="inline-flex items-center gap-2 chip border-gold-600/40 text-gold-300 bg-gold-900/20 mb-5">
        <Zap className="w-3 h-3" />
        AI Hiring Manager · STAR Framework · Live Simulation
      </div>
      <h2 className="font-display text-4xl sm:text-6xl leading-[1.05] text-ink-50 max-w-3xl mx-auto">
        Be ready when your <span className="italic text-gold-300">golden moment</span> arrives.
      </h2>
      <p className="mt-5 text-ink-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
        Most candidates fail not from lack of skill, but from failing to articulate it under pressure.
        Kairós turns your resume into a rehearsal with a relentless AI hiring manager.
      </p>
    </div>
  );
}

function PreparingStage() {
  const steps = ["Reading resume", "Extracting skills & gaps", "Predicting hard questions", "Structuring the interview"];
  return (
    <div className="animate-fadeUp flex flex-col items-center justify-center py-24">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-ink-800" />
        <div className="absolute inset-0 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
        <Sparkles className="w-6 h-6 text-gold-400 absolute inset-0 m-auto" />
      </div>
      <h3 className="font-display text-2xl text-ink-50 mb-2">Preparing your interview</h3>
      <p className="text-ink-400 text-sm mb-6">Chaining prompts: extraction → generation → role setup</p>
      <div className="space-y-2 w-full max-w-sm">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3 text-sm text-ink-300 animate-fadeUp" style={{ animationDelay: `${i * 250}ms` }}>
            <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadyStage({ profile, questions, onStart, onBack }: {
  profile: Profile; questions: Questions; onStart: () => void; onBack: () => void;
}) {
  return (
    <div className="animate-fadeUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-3xl text-ink-50">Your interview brief</h2>
          <p className="text-ink-400 text-sm mt-1">AI-extracted profile and predicted questions, ready to rehearse.</p>
        </div>
        <button className="btn-ghost" onClick={onBack}>
          <RotateCcw className="w-4 h-4" /> Start over
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-6 lg:col-span-1">
          <ProfileCard profile={profile} />
        </div>
        <div className="card p-6 lg:col-span-2">
          <QuestionsCard questions={questions} />
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button className="btn-primary" onClick={onStart}>
          <MessageSquare className="w-4 h-4" />
          Start Live Interview
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-xs text-ink-500">The AI will introduce itself and ask one question at a time.</p>
      </div>
    </div>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <User className="w-4 h-4 text-gold-400" />
        <span className="field-label">Candidate Profile</span>
      </div>
      {profile.summary && (
        <p className="text-ink-200 text-sm leading-relaxed mb-5 italic font-display text-base">
          "{profile.summary}"
        </p>
      )}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center gap-1.5 text-sage-300">
          <Clock className="w-4 h-4" />
          <span className="text-2xl font-semibold">{profile.experience_years ?? "—"}</span>
          <span className="text-xs text-ink-500">yrs experience</span>
        </div>
      </div>
      <SkillGroup title="Hard Skills" items={profile.hard_skills} tone="gold" />
      <SkillGroup title="Soft Skills" items={profile.soft_skills} tone="sage" />
      {profile.gaps && profile.gaps.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3.5 h-3.5 text-red-400" />
            <span className="field-label text-red-300/80">Skill Gaps</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.gaps.map((g, i) => (
              <span key={i} className="chip border-red-500/30 text-red-300 bg-red-950/20">{g}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SkillGroup({ title, items, tone }: { title: string; items?: string[]; tone: "gold" | "sage" }) {
  if (!items || items.length === 0) return null;
  const cls = tone === "gold"
    ? "border-gold-600/30 text-gold-200 bg-gold-900/20"
    : "border-sage-600/30 text-sage-200 bg-sage-900/20";
  return (
    <div className="mb-4">
      <p className="field-label mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s, i) => (
          <span key={i} className={`chip ${cls}`}>{s}</span>
        ))}
      </div>
    </div>
  );
}

function QuestionsCard({ questions }: { questions: Questions }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <ListChecks className="w-4 h-4 text-gold-400" />
        <span className="field-label">Predicted Questions</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <QuestionList title="Behavioral" icon={<User className="w-3.5 h-3.5" />} items={questions.behavioral} />
        <QuestionList title="Technical" icon={<Zap className="w-3.5 h-3.5" />} items={questions.technical} />
      </div>
    </div>
  );
}

function QuestionList({ title, icon, items }: { title: string; icon: React.ReactNode; items?: { question: string; rationale?: string; target_skill?: string }[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gold-400">{icon}</span>
        <h4 className="text-sm font-semibold text-ink-200">{title}</h4>
        <span className="text-xs text-ink-600">({items?.length ?? 0})</span>
      </div>
      <div className="space-y-2.5">
        {items?.map((q, i) => (
          <div key={i} className="rounded-2xl border border-ink-800 bg-ink-900/50 p-3.5 hover:border-gold-500/30 transition-colors">
            <p className="text-sm text-ink-100 leading-relaxed">{q.question}</p>
            {q.target_skill && (
              <span className="chip mt-2 border-ink-700 text-ink-400 bg-ink-800/50 text-[10px]">{q.target_skill}</span>
            )}
            {q.rationale && (
              <p className="text-xs text-ink-500 mt-2 italic">{q.rationale}</p>
            )}
          </div>
        ))}
        {(!items || items.length === 0) && (
          <p className="text-xs text-ink-600 italic">No questions generated.</p>
        )}
      </div>
    </div>
  );
}

function InterviewStage({ history, partial, streaming, input, setInput, onSend, onReset, chatRef, profile, questions }: {
  history: ChatMessage[]; partial: string; streaming: boolean;
  input: string; setInput: (s: string) => void; onSend: () => void; onReset: () => void;
  chatRef: React.RefObject<HTMLDivElement>;
  profile: Profile; questions: Questions;
}) {
  return (
    <div className="animate-fadeUp grid lg:grid-cols-[1fr_320px] gap-5 h-[calc(100vh-220px)] min-h-[520px]">
      <div className="card flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-800/80">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-ink-950" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sage-400 border-2 border-ink-900" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-100">Kairós · Hiring Manager</p>
              <p className="text-xs text-ink-500">{streaming ? "typing…" : "online"}</p>
            </div>
          </div>
          <button className="btn-ghost text-xs" onClick={onReset}>
            <RotateCcw className="w-3.5 h-3.5" /> End
          </button>
        </div>
        <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
          {history.length === 0 && !partial && !streaming && (
            <div className="text-center py-16 text-ink-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-gold-400" />
              <p className="text-sm">Connecting to your interviewer…</p>
            </div>
          )}
          {history.map((m, i) => <ChatBubble key={i} msg={m} />)}
          {partial && <ChatBubble msg={{ role: "assistant", content: partial }} streaming />}
          {streaming && !partial && (
            <div className="flex items-center gap-2 text-ink-500 pl-1">
              <span className="typing-dot" /><span className="typing-dot" style={{ animationDelay: "0.2s" }} /><span className="typing-dot" style={{ animationDelay: "0.4s" }} />
            </div>
          )}
        </div>
        <div className="border-t border-ink-800/80 p-4">
          <div className="flex items-end gap-3">
            <textarea
              className="input-area min-h-[52px] max-h-32 py-3 text-sm"
              placeholder={streaming ? "Kairós is responding…" : "Type your answer… (Shift+Enter for newline)"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
              }}
              disabled={streaming}
            />
            <button className="btn-primary !px-4 !py-3 shrink-0" onClick={onSend} disabled={streaming || !input.trim()}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <aside className="card p-5 overflow-y-auto hidden lg:block">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-gold-400" />
          <span className="field-label">Interview Context</span>
        </div>
        <div className="mb-5">
          <p className="text-xs text-ink-500 mb-2">Profile</p>
          <p className="text-sm text-ink-200 leading-relaxed font-display italic">{profile.summary}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(profile.hard_skills || []).slice(0, 6).map((s, i) => (
              <span key={i} className="chip border-gold-600/30 text-gold-200 bg-gold-900/20 text-[10px]">{s}</span>
            ))}
          </div>
        </div>
        <div className="divider mb-4" />
        <div>
          <p className="text-xs text-ink-500 mb-2">Prepared questions ({(questions.behavioral?.length || 0) + (questions.technical?.length || 0)})</p>
          <div className="space-y-2">
            {questions.behavioral?.map((q, i) => (
              <div key={`b${i}`} className="text-xs text-ink-400 rounded-lg border border-ink-800 bg-ink-900/40 px-3 py-2">
                <span className="text-gold-500/70 font-mono mr-1.5">B{i + 1}</span>{q.question}
              </div>
            ))}
            {questions.technical?.map((q, i) => (
              <div key={`t${i}`} className="text-xs text-ink-400 rounded-lg border border-ink-800 bg-ink-900/40 px-3 py-2">
                <span className="text-sage-500/70 font-mono mr-1.5">T{i + 1}</span>{q.question}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function ChatBubble({ msg, streaming }: { msg: ChatMessage; streaming?: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} animate-fadeUp`}>
      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${isUser ? "bg-ink-800" : "bg-gradient-to-br from-gold-300 to-gold-600"}`}>
        {isUser ? <User className="w-4 h-4 text-ink-300" /> : <Bot className="w-4 h-4 text-ink-950" />}
      </div>
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${isUser ? "bg-ink-800 text-ink-100" : "glass-soft text-ink-100"}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}{streaming && <span className="inline-block w-1.5 h-4 bg-gold-300 ml-0.5 align-middle animate-pulseDot" />}</p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-6 py-8 text-center">
      <div className="divider mb-6" />
      <p className="text-xs text-ink-600">
        Kairós · Prompt-chained AI interview simulator · Extraction → Generation → Role-play
      </p>
    </footer>
  );
}
