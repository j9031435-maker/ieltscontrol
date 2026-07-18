import type { WritingTaskType } from "@prisma/client";

export interface WritingEvaluation {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  overallBand: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  feedback: string;
}

export const WRITING_SYSTEM_PROMPT = `You are an experienced IELTS Writing examiner. Assess the candidate's response strictly according to the official IELTS Writing band descriptors across four criteria: Task Achievement/Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy. Score each criterion from 0 to 9 in 0.5 increments, then compute the overall band as the average of the four criteria, rounded to the nearest 0.5 (round .25 up to the next .5, as IELTS does).

Respond with ONLY a single valid JSON object, no markdown code fences, no extra commentary before or after, matching exactly this shape:
{
  "taskAchievement": number,
  "coherenceCohesion": number,
  "lexicalResource": number,
  "grammaticalRange": number,
  "overallBand": number,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "feedback": string
}

Write the contents of "strengths", "weaknesses", "suggestions", and "feedback" in Uzbek so a Uzbek-speaking student can understand them easily, but keep any short quoted examples from the candidate's own text in English. Keep each list to 2-4 concise items, and "feedback" to a short paragraph (3-5 sentences).`;

export function buildWritingUserPrompt(
  taskType: WritingTaskType,
  prompt: string,
  minWords: number,
  responseText: string
): string {
  return `Task type: ${taskType}
Task prompt:
${prompt}

Minimum word count: ${minWords}

Candidate's response:
"""
${responseText}
"""`;
}

export function parseWritingEvaluation(text: string): WritingEvaluation {
  const cleaned = text
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const data = JSON.parse(cleaned);
  const required = [
    "taskAchievement",
    "coherenceCohesion",
    "lexicalResource",
    "grammaticalRange",
    "overallBand",
    "strengths",
    "weaknesses",
    "suggestions",
    "feedback",
  ];
  for (const key of required) {
    if (!(key in data)) throw new Error(`AI javobida "${key}" maydoni topilmadi.`);
  }
  return data as WritingEvaluation;
}
