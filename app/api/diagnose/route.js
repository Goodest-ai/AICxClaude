// app/api/diagnose/route.js
//
// Server-side Claude API call. The ANTHROPIC_API_KEY stays here.
//
// CRITICAL: the SYSTEM_PROMPT below contains ETHICAL CALIBRATION RULES,
// not just stylistic guidance. Do not weaken or remove the calibration
// rules without re-reading CLAUDE.md § "ethical rules".

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const HORIZON_LABELS = {
  weekend: "this weekend (2-3 days)",
  "2wk": "two weeks",
  "1mo": "one month",
  "3mo": "three months",
};

const SYSTEM_PROMPT = `You are a career diagnosis tool for college students in India.

Your specific user: a 3rd-year engineering student at a Tier-2 college (state engineering / mid-tier private / good govt college, NOT IIT/NIT/BITS/IIIT-H). Tier-2 reality means: limited alumni network in target companies, less project exposure, English fluency varies, college brand is not a tailwind.

Your task: compare the resume against the target role/JD. Identify specific gaps that are likely causing recruiter rejection or auto-filter rejection. Propose fixes calibrated to what is achievable in the user's chosen time horizon.

CALIBRATION RULES (strict):
1. Mark confidence "low" whenever your reasoning depends on assumptions you cannot verify from the resume text.
2. Never claim ATS specifics as fact. Most internship applications are read by humans (often other interns or junior recruiters), not by sophisticated ATS systems. If you reference ATS, mark it speculative.
3. Never recommend the user hide their college name, lie about projects, fabricate experience, or pretend to be from a different background. Fixes must be ADDITIVE — what to ADD or REFRAME truthfully, not what to CONCEAL.
4. Suggest fixes within the user's actual reach. Free or low-cost options must be present. If you suggest a paid resource, mark access_cost as "paid".
5. Time-to-fix estimates should be honest. If something realistically takes 6 months, do not pretend it fits in 2 weeks.
6. If the resume shows signs of distress (failure framing, anxiety, gaps presented as shame, mental health hints), include it in seek_human_when — recommend a counselor, mentor, or trusted senior.
7. Be specific. "Improve projects" is useless. "Replace the Tic-Tac-Toe project with a small REST API in Python that you can describe in 2 sentences" is useful.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences, no commentary:

{
  "diagnoses": [
    {
      "issue": "short title, max 60 chars",
      "category": "skills | projects | signals | framing",
      "why_it_matters": "1-2 sentences explaining why this likely causes filter/rejection for THIS role",
      "confidence": "high | medium | low",
      "fix": "specific actionable fix in 1-2 sentences",
      "time_to_fix": "weekend | 2wk | 1mo | 3mo",
      "access_cost": "free | paid"
    }
  ],
  "cannot_diagnose": [
    "list of 2-4 things you cannot judge from resume text alone (e.g. interview performance, communication skill, cultural fit)"
  ],
  "seek_human_when": [
    "list of 2-4 specific triggers where this user should talk to a real person — mentor, counselor, senior, professional"
  ]
}

Rank diagnoses by likely impact on rejection (highest first). Return 3-5 diagnosis items. Be concise — every word must earn its place.`;

function buildUserMessage(resume, jd, horizon) {
  const horizonLabel = HORIZON_LABELS[horizon] || HORIZON_LABELS["2wk"];
  return `RESUME:
${resume}

TARGET ROLE / JOB DESCRIPTION:
${jd}

USER'S TIME HORIZON FOR FIXES: ${horizonLabel}

Diagnose the resume against this role. Return JSON only.`;
}

function extractJSON(text) {
  let cleaned = text.trim();
  // Strip markdown fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  // Find first { and last } for defensive parsing
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { resume, jd, horizon } = body;

    if (!resume || resume.trim().length < 100) {
      return NextResponse.json(
        { error: "Resume too short — paste at least a full resume." },
        { status: 400 }
      );
    }
    if (!jd || jd.trim().length < 50) {
      return NextResponse.json(
        { error: "Target role description too short — paste a full JD." },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserMessage(resume, jd, horizon) },
      ],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = extractJSON(text);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Diagnosis error:", err);
    const message =
      err?.message?.includes("JSON")
        ? "The model returned an unexpected format. Try running diagnosis again."
        : err?.message || "Something went wrong running the diagnosis.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
