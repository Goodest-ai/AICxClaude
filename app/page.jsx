"use client";

import React, { useState, useEffect } from "react";
import {
  FileText, Briefcase, Loader2, AlertCircle, CheckCircle2,
  MinusCircle, ChevronDown, ChevronUp, RotateCcw, Info, UserRound,
  Calendar,
} from "lucide-react";

// ============================================================================
// DIAGNOSE — career filter diagnosis tool
// Built for 3rd-year Tier-2 Indian engineering students.
// Honest, confidence-labeled, additive-only fixes.
//
// Calls /api/diagnose. The Anthropic API key stays server-side.
// ============================================================================

const SAMPLE_RESUME = `Aditya Kumar
B.Tech Computer Science, 3rd Year (CGPA: 7.8)
HBTU Kanpur, Uttar Pradesh
adityak.cs@example.com | +91 90xxxxxxxx | github.com/adityak

SKILLS
Languages: C, C++, Python, Java (basic)
Web: HTML, CSS, JavaScript, React (learning)
DBMS: MySQL
Tools: Git, VS Code

PROJECTS
1. College Library Management System (Java, MySQL) — semester project, team of 4
2. Personal Portfolio Website (HTML, CSS, JS) — hosted on GitHub Pages
3. Tic-Tac-Toe Game (Python) — console-based, used minimax

ACHIEVEMENTS
- Solved 150+ problems on LeetCode
- Class representative, 2nd year
- Participated in college hackathon (no prize)

EDUCATION
B.Tech CSE, HBTU Kanpur, 2022 - 2026 (expected), CGPA 7.8
12th, CBSE, 2021 - 88%
10th, CBSE, 2019 - 92%`;

const SAMPLE_JD = `Software Development Engineer Intern — Backend
Location: Bangalore (in-office)
Duration: 6 months
Stipend: ₹50,000/month

We're looking for a backend-focused intern to work on our payments infrastructure team. You will:
- Design and ship REST APIs handling 100K+ requests/day
- Work with Postgres, Redis, Kafka in production
- Collaborate on system design reviews
- Write tested, monitored, documented code

Required:
- Strong fundamentals in DSA and OOP
- Proficient in at least one of: Go, Java, Python
- Familiarity with SQL and at least one NoSQL store
- Has shipped a real project (not just coursework)
- Comfortable reading existing codebases

Nice to have:
- Open-source contributions
- Past internship at a tech company
- Familiarity with distributed systems concepts (CAP, queues, caching)
- Active GitHub with consistent commits`;

const HORIZONS = [
  { id: "weekend", label: "This weekend", days: "2-3 days" },
  { id: "2wk", label: "Two weeks", days: "14 days" },
  { id: "1mo", label: "One month", days: "~30 days" },
  { id: "3mo", label: "Three months", days: "~90 days" },
];

const CONFIDENCE_STYLES = {
  high: { label: "High confidence", dot: "bg-emerald-700", pill: "bg-emerald-50 text-emerald-900 border-emerald-200" },
  medium: { label: "Medium confidence", dot: "bg-amber-600", pill: "bg-amber-50 text-amber-900 border-amber-200" },
  low: { label: "Low confidence — speculative", dot: "bg-stone-500", pill: "bg-stone-100 text-stone-700 border-stone-300" },
};

const CATEGORY_LABELS = {
  skills: "Skills gap",
  projects: "Project signal",
  signals: "Recruiter signals",
  framing: "Resume framing",
};

const HORIZON_RANK = { weekend: 0, "2wk": 1, "1mo": 2, "3mo": 3 };

const BUCKET_LABELS = {
  weekend: "This weekend",
  "2wk": "Next two weeks",
  "1mo": "This month",
  "3mo": "Next three months",
};

const BUCKET_ORDER = ["weekend", "2wk", "1mo", "3mo"];

export default function Page() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [horizon, setHorizon] = useState("2wk");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dismissed, setDismissed] = useState({});
  const [expanded, setExpanded] = useState({});
  const [exploring, setExploring] = useState(false);
  const [exploreResult, setExploreResult] = useState(null);
  const [exploreError, setExploreError] = useState(null);

  // Loading step animator
  useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const id = setInterval(() => setLoadingStep((s) => Math.min(s + 1, 3)), 1100);
    return () => clearInterval(id);
  }, [loading]);

  const loadSample = () => {
    setResume(SAMPLE_RESUME);
    setJd(SAMPLE_JD);
    setHorizon("2wk");
    setResult(null);
    setError(null);
    setDismissed({});
    setExpanded({});
    setExploreResult(null);
    setExploreError(null);
  };

  const reset = () => {
    setResume(""); setJd(""); setHorizon("2wk");
    setResult(null); setError(null); setDismissed({}); setExpanded({});
    setExploreResult(null); setExploreError(null);
  };

  const runDiagnosis = async () => {
    if (resume.trim().length < 100) {
      setError("Resume looks too short — paste at least a full resume (skills, projects, education).");
      return;
    }
    if (jd.trim().length < 50) {
      setError("Target role description is too short — paste a full JD or role description.");
      return;
    }
    setError(null);
    setResult(null);
    setDismissed({});
    setExpanded({});
    setLoading(true);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jd, horizon }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Server returned ${response.status}`);
      }

      const initialExpanded = {};
      (data.diagnoses || []).forEach((_, i) => { if (i < 2) initialExpanded[i] = true; });
      setExpanded(initialExpanded);
      setResult(data);
      setExploreResult(null);
      setExploreError(null);
    } catch (e) {
      setError(`Couldn't complete diagnosis: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exploreRoles = async () => {
    setExploring(true);
    setExploreError(null);
    setExploreResult(null);
    try {
      const response = await fetch("/api/explore-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jd, horizon, diagnoses: result?.diagnoses || [] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Server returned ${response.status}`);
      setExploreResult(data);
    } catch (e) {
      setExploreError(`Couldn't load adjacent roles: ${e.message}`);
    } finally {
      setExploring(false);
    }
  };

  const toggleDismiss = (i) => setDismissed((d) => ({ ...d, [i]: !d[i] }));
  const toggleExpand = (i) => setExpanded((d) => ({ ...d, [i]: !d[i] }));
  const focusDiagnosis = (i) => {
    setExpanded((d) => ({ ...d, [i]: true }));
    if (typeof document !== "undefined") {
      const el = document.getElementById(`diagnosis-card-${i}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const diagnoses = result?.diagnoses || [];
  const activeCount = diagnoses.filter((_, i) => !dismissed[i]).length;
  const highConf = diagnoses.filter((d) => d.confidence === "high").length;
  const lowConf = diagnoses.filter((d) => d.confidence === "low").length;

  // Roadmap: active (non-dismissed) cards grouped by fix horizon.
  // Keep original diagnosis indexes so timeline chips can jump back to cards.
  const activeDiagnosisEntries = diagnoses
    .map((diagnosis, index) => ({ diagnosis, index }))
    .filter(({ index }) => !dismissed[index]);
  const userRank = HORIZON_RANK[horizon] ?? 1;
  const sortRoadmapEntries = (a, b) => {
    if (a.diagnosis.access_cost !== b.diagnosis.access_cost) {
      return a.diagnosis.access_cost === "free" ? -1 : 1;
    }
    return a.index - b.index;
  };
  const roadmapBuckets = BUCKET_ORDER.map((bucket) => ({
    bucket,
    fitsWindow: (HORIZON_RANK[bucket] ?? 99) <= userRank,
    items: activeDiagnosisEntries
      .filter(({ diagnosis }) => diagnosis.time_to_fix === bucket)
      .sort(sortRoadmapEntries),
  }));
  const roadmapHasItems = roadmapBuckets.some(({ items }) => items.length > 0);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage:
          "radial-gradient(circle at 10% 0%, rgba(178, 95, 60, 0.04) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(45, 60, 80, 0.05) 0%, transparent 50%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-10 md:px-10 md:py-16">

        {/* HEADER */}
        <header className="border-b border-stone-300 pb-8 mb-10">
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
                A diagnostic tool · v0.1
              </div>
              <h1
                style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, letterSpacing: "-0.02em" }}
                className="text-5xl md:text-6xl leading-[0.95]"
              >
                Why didn't they<br />
                <span style={{ fontStyle: "italic", fontWeight: 400, color: "#A35836" }}>
                  call you back?
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-stone-700 leading-relaxed">
                For 3rd-year students at Tier-2 Indian engineering colleges. Paste your resume + a role you applied to. Get an honest, ranked diagnosis of what's likely keeping you out — and what's fixable in the time you have.
              </p>
            </div>
            <div className="text-right text-xs text-stone-500 max-w-[200px]">
              Built for the AIC × Anthropic Claude hackathon.<br />Solo · 24h · honest by design.
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {/* LEFT: INPUT */}
          <div className="md:col-span-2 space-y-7">

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <FileText size={16} strokeWidth={1.5} />
                Your resume <span className="text-stone-400 font-normal">(paste plain text)</span>
              </label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your full resume here — skills, projects, education, achievements..."
                rows={10}
                className="w-full px-4 py-3 bg-white/60 border border-stone-300 rounded-sm text-sm focus:outline-none focus:border-stone-900 transition-colors resize-y"
              />
              <div className="text-xs text-stone-500 mt-1">
                {resume.length} characters · stays in your browser, never stored.
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Briefcase size={16} strokeWidth={1.5} />
                Target role <span className="text-stone-400 font-normal">(paste the JD or describe the role)</span>
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description for the role you applied to (or want to apply to)..."
                rows={6}
                className="w-full px-4 py-3 bg-white/60 border border-stone-300 rounded-sm text-sm focus:outline-none focus:border-stone-900 transition-colors resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time horizon for fixes</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {HORIZONS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setHorizon(h.id)}
                    className={`px-3 py-3 text-sm border rounded-sm transition-all text-left ${
                      horizon === h.id
                        ? "bg-stone-900 text-stone-50 border-stone-900"
                        : "bg-white/40 border-stone-300 hover:border-stone-900"
                    }`}
                  >
                    <div className="font-medium">{h.label}</div>
                    <div className="text-xs opacity-70">{h.days}</div>
                  </button>
                ))}
              </div>
              <div className="text-xs text-stone-500 mt-2">
                Sets your current window. Each fix still goes in the bucket where it honestly belongs.
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={runDiagnosis}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium tracking-wide uppercase bg-stone-900 text-stone-50 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm flex items-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Diagnosing...</>
                ) : (
                  "Run diagnosis"
                )}
              </button>
              <button
                onClick={loadSample}
                disabled={loading}
                className="px-5 py-3 text-sm font-medium border border-stone-400 hover:bg-white/40 transition-colors rounded-sm"
              >
                Try with example
              </button>
              {(resume || jd || result) && (
                <button
                  onClick={reset}
                  disabled={loading}
                  className="px-5 py-3 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors rounded-sm flex items-center gap-2"
                >
                  <RotateCcw size={14} /> Reset
                </button>
              )}
            </div>

            {error && (
              <div className="border border-red-300 bg-red-50/60 p-4 rounded-sm flex gap-3 text-sm">
                <AlertCircle size={18} className="text-red-700 flex-shrink-0 mt-0.5" />
                <div className="text-red-900">{error}</div>
              </div>
            )}

            {loading && (
              <div className="border border-stone-300 bg-white/40 p-5 rounded-sm space-y-2 text-sm">
                <div className="text-xs uppercase tracking-wider text-stone-500 mb-3">
                  What we're doing
                </div>
                <LoadingStep done={loadingStep > 0} active={loadingStep === 0} text="Reading your resume" />
                <LoadingStep done={loadingStep > 1} active={loadingStep === 1} text="Comparing to role expectations" />
                <LoadingStep done={loadingStep > 2} active={loadingStep === 2} text="Identifying gaps · ranking by impact" />
                <LoadingStep done={loadingStep > 3} active={loadingStep === 3} text="Placing fixes by honest time-to-fix" />
              </div>
            )}

            {result && (
              <div className="space-y-5 pt-4">
                <div className="flex items-baseline justify-between border-b border-stone-300 pb-3">
                  <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }} className="text-3xl">
                    Diagnosis
                  </h2>
                  <div className="text-xs text-stone-600">
                    {activeCount} active · {highConf} high-confidence · {lowConf} speculative
                  </div>
                </div>

                {Array.isArray(result.whats_working) && result.whats_working.length > 0 && (
                  <div className="border border-emerald-300 bg-emerald-50/60 p-5 rounded-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 size={15} className="text-emerald-700" />
                      <div className="text-xs uppercase tracking-[0.15em] text-emerald-900 font-medium">
                        What's already working
                      </div>
                    </div>
                    <ul className="text-sm space-y-2 text-emerald-950 leading-relaxed">
                      {result.whats_working.map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-emerald-600 mt-1">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-[11px] text-emerald-800/70 mt-3 italic">
                      Don't lose these. Keep them on the resume; the gaps below are what's missing on top of these.
                    </div>
                  </div>
                )}

                {diagnoses.length > 0 && (
                  <EffortImpactPlot
                    diagnoses={diagnoses}
                    dismissed={dismissed}
                    onDotClick={focusDiagnosis}
                  />
                )}

                {diagnoses.map((d, i) => {
                  const dis = dismissed[i];
                  const exp = expanded[i];
                  const conf = CONFIDENCE_STYLES[d.confidence] || CONFIDENCE_STYLES.medium;
                  return (
                    <div
                      key={i}
                      id={`diagnosis-card-${i}`}
                      className={`border border-stone-300 bg-white/60 rounded-sm transition-all scroll-mt-10 ${dis ? "opacity-40" : ""}`}
                    >
                      <button
                        onClick={() => toggleExpand(i)}
                        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-stone-50/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-xs uppercase tracking-wider text-stone-500">
                              #{i + 1} · {CATEGORY_LABELS[d.category] || d.category}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 border rounded-full ${conf.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                              {conf.label}
                            </span>
                          </div>
                          <div
                            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
                            className={`text-xl leading-snug ${dis ? "line-through" : ""}`}
                          >
                            {d.issue}
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-1 text-stone-500">
                          {exp ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {exp && (
                        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-stone-200">
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.15em] text-stone-500 mb-1">
                              Why it matters
                            </div>
                            <div className="text-sm leading-relaxed text-stone-800">
                              {d.why_it_matters}
                            </div>
                          </div>
                          <div className="bg-stone-900 text-stone-50 p-4 rounded-sm">
                            <div className="text-[10px] uppercase tracking-[0.15em] text-stone-400 mb-1">
                              Suggested fix
                            </div>
                            <div className="text-sm leading-relaxed">{d.fix}</div>
                            <div className="flex flex-wrap gap-3 mt-3 text-[11px]">
                              <span className="inline-flex items-center gap-1.5 text-stone-300">
                                <span className="opacity-60">Time:</span>
                                <span className="font-medium">{d.time_to_fix}</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-stone-300">
                                <span className="opacity-60">Access:</span>
                                <span className={`font-medium ${d.access_cost === "free" ? "text-emerald-300" : "text-amber-300"}`}>
                                  {d.access_cost}
                                </span>
                              </span>
                            </div>
                          </div>
                          {d.reasoning && (
                            <div className="bg-stone-100/70 border border-stone-200 p-4 rounded-sm">
                              <div className="text-[10px] uppercase tracking-[0.15em] text-stone-500 mb-1">
                                How we figured this out
                              </div>
                              <div className="text-sm leading-relaxed text-stone-700 italic">
                                {d.reasoning}
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => toggleDismiss(i)}
                            className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-2 transition-colors flex items-center gap-1.5"
                          >
                            <MinusCircle size={12} />
                            {dis ? "Restore this diagnosis" : "Disagree — dismiss this one"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {roadmapHasItems && (
                  <div className="border-t border-stone-300 pt-8 mt-4 space-y-5">
                    <div className="flex items-baseline justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-stone-700" strokeWidth={1.5} />
                        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }} className="text-3xl">
                          Your roadmap
                        </h2>
                      </div>
                      <div className="text-xs text-stone-600">
                        Current window: {(HORIZONS.find((h) => h.id === horizon)?.label || "").toLowerCase()}
                      </div>
                    </div>
                    <div className="text-sm text-stone-600 leading-relaxed">
                      Fixes stay in their real time bucket. Your selected window only marks what fits now.
                    </div>

                    <div className="border border-stone-300 bg-white/40 rounded-sm p-5">
                      <div className="relative grid grid-cols-4 gap-3">
                        <div className="absolute left-[12.5%] right-[12.5%] top-6 h-px bg-stone-300" />
                        {roadmapBuckets.map(({ bucket, fitsWindow, items }) => (
                          <div
                            key={bucket}
                            className={`relative min-w-0 rounded-sm border p-3 ${
                              fitsWindow
                                ? "border-stone-400 bg-white/70"
                                : "border-stone-200 bg-stone-50/70"
                            }`}
                          >
                            <div className="relative z-10 flex items-start justify-between gap-2 mb-4">
                              <div>
                                <div
                                  className={`mx-auto mb-2 h-3 w-3 rounded-full border-2 ${
                                    fitsWindow
                                      ? "border-stone-900 bg-stone-900"
                                      : "border-stone-300 bg-white"
                                  }`}
                                />
                                <div className="text-[11px] uppercase tracking-wider text-stone-500">
                                  {BUCKET_LABELS[bucket]}
                                </div>
                              </div>
                              <span
                                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                  fitsWindow
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-stone-100 text-stone-600 border-stone-300"
                                }`}
                              >
                                {fitsWindow ? "In window" : "After window"}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {items.length === 0 ? (
                                <div className="min-h-[72px] rounded-sm border border-dashed border-stone-200 bg-white/40 px-3 py-4 text-xs text-stone-400">
                                  No active fix here
                                </div>
                              ) : (
                                items.map(({ diagnosis, index }) => {
                                  const isFree = diagnosis.access_cost === "free";
                                  return (
                                    <button
                                      key={`${bucket}-${index}`}
                                      onClick={() => focusDiagnosis(index)}
                                      className={`w-full rounded-sm border p-2.5 text-left transition-colors ${
                                        fitsWindow
                                          ? isFree
                                            ? "border-emerald-300 bg-emerald-50/70 hover:border-emerald-700"
                                            : "border-amber-300 bg-amber-50/70 hover:border-amber-700"
                                          : "border-stone-200 bg-white/50 text-stone-600 hover:border-stone-400"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span
                                          className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                            fitsWindow
                                              ? "bg-stone-900 text-stone-50"
                                              : "bg-stone-200 text-stone-700"
                                          }`}
                                        >
                                          {index + 1}
                                        </span>
                                        <span
                                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                            isFree
                                              ? "bg-white text-emerald-800 border-emerald-200"
                                              : "bg-white text-amber-900 border-amber-200"
                                          }`}
                                        >
                                          {diagnosis.access_cost}
                                        </span>
                                      </div>
                                      <div className="mt-2 text-xs font-medium leading-snug text-stone-900">
                                        {diagnosis.issue}
                                      </div>
                                      {!fitsWindow && (
                                        <div className="mt-1 text-[11px] text-stone-500">
                                          Needs more time than your selected window
                                        </div>
                                      )}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 italic pt-1">
                      Click any number to open the full diagnosis. Dismissed items disappear; time estimates do not shrink to fit the window.
                    </div>
                  </div>
                )}

                <div className="border-t border-stone-300 pt-8 mt-4 space-y-4">
                  <div className="flex items-baseline justify-between flex-wrap gap-3">
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }} className="text-3xl">
                      Adjacent role families
                    </h2>
                    {!exploreResult && !exploring && (
                      <button
                        onClick={exploreRoles}
                        className="px-4 py-2 text-xs font-medium tracking-wide uppercase border border-stone-900 hover:bg-stone-900 hover:text-stone-50 transition-colors rounded-sm"
                      >
                        Show me adjacent roles
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Roles that fit your strengths in different shapes — <em>not</em> easier targets, <em>not</em> a fallback. Your original target stays your target.
                  </p>

                  {exploring && (
                    <div className="border border-stone-300 bg-white/40 p-5 rounded-sm flex items-center gap-3 text-sm">
                      <Loader2 size={16} className="animate-spin text-stone-700" />
                      <span className="text-stone-700">Looking for role shapes that match your strengths...</span>
                    </div>
                  )}

                  {exploreError && (
                    <div className="border border-red-300 bg-red-50/60 p-4 rounded-sm flex gap-3 text-sm">
                      <AlertCircle size={18} className="text-red-700 flex-shrink-0 mt-0.5" />
                      <div className="text-red-900">{exploreError}</div>
                    </div>
                  )}

                  {exploreResult && (
                    <div className="space-y-4">
                      {exploreResult.original_target_reachable && (
                        <div className="border-l-2 border-emerald-700 bg-emerald-50/40 px-4 py-3 text-sm text-emerald-950 italic leading-relaxed">
                          {exploreResult.original_target_reachable}
                        </div>
                      )}
                      {Array.isArray(exploreResult.adjacent_roles) && exploreResult.adjacent_roles.map((r, i) => {
                        const conf = CONFIDENCE_STYLES[r.confidence] || CONFIDENCE_STYLES.medium;
                        return (
                          <div key={i} className="border border-stone-300 bg-white/60 rounded-sm p-4">
                            <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                              <div
                                style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
                                className="text-lg leading-snug flex-1 min-w-0"
                              >
                                {r.role_family}
                              </div>
                              <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 border rounded-full self-start flex-shrink-0 ${conf.pill}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                                {conf.label}
                              </span>
                            </div>
                            <div className="text-sm text-stone-700 leading-relaxed mb-1.5">
                              <span className="text-[10px] uppercase tracking-[0.15em] text-stone-500 mr-1.5">Why fit:</span>
                              {r.why_fit}
                            </div>
                            <div className="text-sm text-stone-600 leading-relaxed">
                              <span className="text-[10px] uppercase tracking-[0.15em] text-stone-500 mr-1.5">Shape diff:</span>
                              {r.shape_difference}
                            </div>
                          </div>
                        );
                      })}
                      <div className="text-[11px] text-stone-500 italic">
                        Exploration suggestions, not redirects. The diagnosis above is still your map to the original target.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: PERMANENT ETHICS PANELS */}
          <aside className="md:col-span-1 space-y-6 md:sticky md:top-10 md:self-start">

            <div className="border border-stone-400 bg-stone-100/60 p-5 rounded-sm">
              <div className="flex items-center gap-2 mb-3">
                <Info size={15} className="text-stone-600" />
                <div className="text-xs uppercase tracking-[0.15em] text-stone-700 font-medium">
                  What we can't tell you
                </div>
              </div>
              <ul className="text-sm space-y-2 text-stone-700 leading-relaxed">
                {(result?.cannot_diagnose && result.cannot_diagnose.length > 0
                  ? result.cannot_diagnose
                  : [
                      "Whether you'll actually pass the interview",
                      "How you come across in real conversation",
                      "Whether the recruiter is biased toward your college name",
                      "Whether this specific company is right for you",
                    ]
                ).map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-stone-400 mt-1">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-amber-700 bg-amber-50/70 p-5 rounded-sm">
              <div className="flex items-center gap-2 mb-3">
                <UserRound size={15} className="text-amber-800" />
                <div className="text-xs uppercase tracking-[0.15em] text-amber-900 font-medium">
                  Talk to a real person when
                </div>
              </div>
              <ul className="text-sm space-y-2 text-amber-950 leading-relaxed">
                {(result?.seek_human_when && result.seek_human_when.length > 0
                  ? result.seek_human_when
                  : [
                      "You've been rejected so often it's affecting your mental health — see your college counselor",
                      "You need career direction, not just resume tweaks — find a senior or alum who's done what you want",
                      "You're considering hiding facts on your resume — talk to a mentor first",
                      "You feel stuck and don't know why — a 30-min call beats any tool",
                    ]
                ).map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-700 mt-1">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-stone-500 leading-relaxed space-y-2 pt-2 border-t border-stone-300">
              <div className="uppercase tracking-[0.2em] text-stone-700 font-medium mb-2">
                Built honest
              </div>
              <p>· Fixes are <em>additive only</em>. We never tell you to hide your college, fake projects, or pretend to be someone you're not.</p>
              <p>· Confidence labels on every claim. Low-confidence items are speculative — your judgment beats ours.</p>
              <p>· Free-access fixes prioritized. Paid resources flagged.</p>
              <p>· Your resume stays in your browser. Not stored.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function LoadingStep({ done, active, text }) {
  return (
    <div className={`flex items-center gap-3 transition-opacity ${done || active ? "opacity-100" : "opacity-40"}`}>
      {done ? (
        <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
      ) : active ? (
        <Loader2 size={16} className="animate-spin text-stone-700 flex-shrink-0" />
      ) : (
        <div className="w-4 h-4 border border-stone-400 rounded-full flex-shrink-0" />
      )}
      <span className={done ? "text-stone-900" : active ? "text-stone-900 font-medium" : "text-stone-500"}>
        {text}
      </span>
    </div>
  );
}

function EffortImpactPlot({ diagnoses, dismissed, onDotClick }) {
  // Plot area: viewBox 800x360. Padding leaves room for axis labels.
  const padL = 80, padR = 30, padT = 30, padB = 70;
  const W = 800, H = 360;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const midX = padL + plotW / 2;
  const midY = padT + plotH / 2;

  const colWidth = plotW / 4;
  const xForBucket = (idx) => padL + colWidth * idx + colWidth / 2;
  const yForRank = (rank, total) =>
    total <= 1 ? padT + plotH / 2 : padT + (rank - 1) * (plotH / (total - 1));

  const FILL = { high: "#047857", medium: "#d97706", low: "#78716c" };
  const total = diagnoses.length;

  return (
    <div className="border border-stone-300 bg-white/40 rounded-sm p-5">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
        <div className="text-xs uppercase tracking-[0.15em] text-stone-700 font-medium">
          Effort vs likely impact
        </div>
        <div className="text-[11px] text-stone-500 italic">
          Click a number to jump to that diagnosis
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 380 }}>
        {/* Quadrant tints */}
        <rect x={padL} y={padT} width={plotW / 2} height={plotH / 2} fill="#10b981" opacity="0.06" />
        <rect x={midX} y={midY} width={plotW / 2} height={plotH / 2} fill="#78716c" opacity="0.05" />

        {/* Quadrant labels */}
        <text x={padL + 12} y={padT + 18} fontSize="11" fill="#065f46" opacity="0.85" style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Quick wins
        </text>
        <text x={W - padR - 12} y={H - padB - 8} fontSize="11" fill="#57534e" opacity="0.7" textAnchor="end" style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Defer
        </text>

        {/* Crosshair */}
        <line x1={padL} y1={midY} x2={W - padR} y2={midY} stroke="#d6d3d1" strokeDasharray="2,3" />
        <line x1={midX} y1={padT} x2={midX} y2={H - padB} stroke="#d6d3d1" strokeDasharray="2,3" />

        {/* Axes */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#a8a29e" />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#a8a29e" />

        {/* X-axis bucket labels */}
        {BUCKET_ORDER.map((bucket, i) => (
          <text
            key={bucket}
            x={xForBucket(i)}
            y={H - padB + 18}
            textAnchor="middle"
            fontSize="11"
            fill="#44403c"
          >
            {BUCKET_LABELS[bucket]}
          </text>
        ))}

        {/* Axis titles */}
        <text x={midX} y={H - 12} textAnchor="middle" fontSize="11" fill="#78716c" fontStyle="italic">
          Effort to fix →
        </text>
        <text
          x={20}
          y={midY}
          textAnchor="middle"
          fontSize="11"
          fill="#78716c"
          fontStyle="italic"
          transform={`rotate(-90, 20, ${midY})`}
        >
          ↑ Higher impact
        </text>

        {/* Dots */}
        {diagnoses.map((d, i) => {
          const bucketIdx = BUCKET_ORDER.indexOf(d.time_to_fix);
          if (bucketIdx === -1) return null;
          const x = xForBucket(bucketIdx);
          const y = yForRank(i + 1, total);
          const isDismissed = dismissed[i];
          const fill = FILL[d.confidence] || FILL.medium;
          return (
            <g
              key={i}
              onClick={() => onDotClick && onDotClick(i)}
              style={{ cursor: "pointer", opacity: isDismissed ? 0.3 : 1 }}
            >
              <title>{`#${i + 1} ${d.issue} — ${d.confidence}-confidence, fits in ${BUCKET_LABELS[d.time_to_fix] || d.time_to_fix}`}</title>
              <circle cx={x} cy={y} r="13" fill={fill} stroke="#fafaf9" strokeWidth="2.5" />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#fafaf9"
                pointerEvents="none"
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 mt-3 text-[10px] uppercase tracking-wider text-stone-600">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#047857" }} />High</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#d97706" }} />Medium</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#78716c" }} />Low (speculative)</span>
      </div>
    </div>
  );
}
