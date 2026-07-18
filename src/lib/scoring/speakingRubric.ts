export interface SpeakingEvaluation {
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  overallBand: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  feedback: string;
}

export interface SpeakingPartTranscript {
  part: number;
  promptText: string;
  transcript: string;
}

export const SPEAKING_SYSTEM_PROMPT = `You are an experienced IELTS Speaking examiner. You will be given the transcript of a candidate's spoken answers (converted from speech to text by the candidate's browser) across Part 1, Part 2, and Part 3 of a Speaking test. Assess the transcript according to the official IELTS Speaking band descriptors across four criteria: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation. Score each criterion from 0 to 9 in 0.5 increments, then compute the overall band as the average of the four criteria, rounded to the nearest 0.5.

Important limitation: you only have a text transcript, not the audio, so you CANNOT directly judge pronunciation, intonation, or stress. For the "pronunciation" score, give a cautious, conservative estimate based only on indirect textual clues (e.g. phrasing that suggests non-native word order, self-corrections, filler words transcribed), and make it clear in the feedback that this score is a rough estimate, not a real pronunciation assessment.

Respond with ONLY a single valid JSON object, no markdown code fences, no extra commentary, matching exactly this shape:
{
  "fluencyCoherence": number,
  "lexicalResource": number,
  "grammaticalRange": number,
  "pronunciation": number,
  "overallBand": number,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "feedback": string
}

Write "strengths", "weaknesses", "suggestions", and "feedback" in Uzbek so the student can understand them easily, but keep any quoted examples from the candidate's transcript in English. Keep each list to 2-4 concise items, and "feedback" to a short paragraph (3-5 sentences) that explicitly reminds the student that pronunciation could not be truly assessed from text alone.`;

export function buildSpeakingUserPrompt(
  setTitle: string,
  parts: SpeakingPartTranscript[]
): string {
  const sections = parts
    .map(
      (p) =>
        `Part ${p.part} — ${p.promptText}\nCandidate's transcribed answer:\n"""\n${
          p.transcript.trim() || "(no response recorded)"
        }\n"""`
    )
    .join("\n\n");
  return `Speaking test set: ${setTitle}\n\n${sections}`;
}

export function parseSpeakingEvaluation(text: string): SpeakingEvaluation {
  const cleaned = text
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const data = JSON.parse(cleaned);
  const required = [
    "fluencyCoherence",
    "lexicalResource",
    "grammaticalRange",
    "pronunciation",
    "overallBand",
    "strengths",
    "weaknesses",
    "suggestions",
    "feedback",
  ];
  for (const key of required) {
    if (!(key in data)) throw new Error(`AI javobida "${key}" maydoni topilmadi.`);
  }
  return data as SpeakingEvaluation;
}
