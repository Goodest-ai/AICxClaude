// app/api/explore-roles/route.js
//
// Server-side Claude call for the "Adjacent role families" feature.
//
// CRITICAL: this endpoint must NEVER produce verdicts ("you're not a fit"),
// recommend "easier" roles, or imply the user should aim lower because of
// their college tier. The system prompt below is the ethical contract;
// do not weaken it without re-reading PITCH.md.

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

const SYSTEM_PROMPT = `You are a career role-EXPLORATION helper for Indian engineering students at Tier-2 colleges (state engineering / mid-tier private / good govt college, NOT IIT/NIT/BITS/IIIT-H).

Your job is NOT to recommend easier roles or to redirect the user away from their target. Your job is to surface 2-3 ADJACENT role families that fit the resume's strengths but differ in SHAPE (team type, problem domain, tech focus, scope) — for the user's exploration, not as a fallback.

HARD RULES (strict, non-negotiable):
1. Do NOT recommend lower-prestige, lower-pay, or "easier" roles. NEVER imply the user should aim lower because of their college, or because of any structural disadvantage. Suggestions must differ in SHAPE, not in DIFFICULTY.
2. Every suggestion must cite a SPECIFIC strength from the resume — a project, a skill, an achievement. Generic suggestions ("you'd be good at QA") are wrong.
3. Never frame suggestions as alternatives to the original target. The original goal remains valid; you are expanding the user's mental map of where their strengths transfer.
4. ALWAYS start the response with a brief affirmation that the original target is still reachable in the user's chosen horizon — this prevents the suggestions from reading as "you can't get the original." Cite what they need to add to reach it.
5. No more than 3 suggestions. Each must include a confidence label (high/medium/low). Use "low" liberally — most role-fit reasoning is speculative from a resume alone.
6. Suggestions must be specific role families, not generic categories. Bad: "Software Engineering". Good: "Developer-tooling / internal-platform internships at SaaS companies" or "Backend roles at fintech startups handling payments".
7. NEVER recommend hiding college, faking projects, or any concealment. Same ethical floor as the diagnosis tool — fixes/suggestions are additive only.

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences, no commentary:

{
  "original_target_reachable": "1 sentence affirming the user's original target is still reachable in their chosen horizon, citing what they need to add to get there",
  "adjacent_roles": [
    {
      "role_family": "specific role family name, max 70 chars",
      "why_fit": "1-2 sentences citing a SPECIFIC resume strength (project name, skill, achievement) and how it transfers to this role family",
      "shape_difference": "1 sentence on how this role's SHAPE differs from the original target — focus on responsibilities/team/tech/domain, NOT difficulty",
      "confidence": "high | medium | low"
    }
  ]
}

Return 2-3 role families. Be specific. Be honest about confidence.`;

function buildUserMessage(resume, jd, horizon, diagnoses) {
  const horizonLabel = HORIZON_LABELS[horizon] || HORIZON_LABELS["2wk"];
  const diagSummary = (diagnoses || [])
    .slice(0, 5)
    .map((d, i) => `${i + 1}. ${d.issue} (${d.confidence}-confidence, fixable in ${d.time_to_fix})`)
    .join("\n") || "(none provided)";

  return `RESUME:
${resume}

ORIGINAL TARGET ROLE / JD:
${jd}

USER'S CHOSEN TIME HORIZON: ${horizonLabel}

DIAGNOSED GAPS FOR THE ORIGINAL TARGET:
${diagSummary}

Suggest 2-3 adjacent role families per the rules above. Return JSON only.`;
}

function extractJSON(text) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
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
    const { resume, jd, horizon, diagnoses } = body;

    if (!resume || resume.trim().length < 100) {
      return NextResponse.json(
        { error: "Resume too short — paste at least a full resume." },
        { status: 400 }
      );
    }
    if (!jd || jd.trim().length < 50) {
      return NextResponse.json(
        { error: "Target role description too short." },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserMessage(resume, jd, horizon, diagnoses) },
      ],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = extractJSON(text);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Explore roles error:", err);
    const message = err?.message?.includes("JSON")
      ? "The model returned an unexpected format. Try again."
      : err?.message || "Couldn't generate adjacent roles.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
