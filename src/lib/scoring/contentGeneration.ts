import { z } from "zod";
import { chartSpecSchema } from "@/lib/chartSpec";

const questionSchema = z.object({
  type: z.enum(["MCQ", "TRUE_FALSE_NG", "FILL_BLANK"]),
  promptText: z.string().min(3),
  options: z.array(z.string().min(1)).min(2).max(6).optional(),
  correctAnswer: z.string().min(1),
});

// One passage (Reading) or one section (Listening).
const partContentSchema = z.object({
  title: z.string().min(2),
  bodyText: z.string().min(80),
  questions: z.array(questionSchema).min(8).max(14),
});

const writingTaskSchema = z.object({
  title: z.string().min(2),
  taskType: z.enum(["TASK1", "TASK2"]),
  minWords: z.number().int().min(120).max(300),
  prompt: z.string().min(30),
  chart: chartSpecSchema.optional(),
});

const writingSetSchema = z.object({
  tasks: z.array(writingTaskSchema).min(2).max(2),
});

const speakingPartSchema = z.object({
  promptText: z.string().min(3),
  followUps: z.array(z.string().min(3)).min(3).max(4),
});

const speakingSetItemSchema = z.object({
  title: z.string().min(2),
  part1: speakingPartSchema,
  part2: speakingPartSchema,
  part3: speakingPartSchema,
});

const speakingSetSchema = z.object({
  sets: z.array(speakingSetItemSchema).min(2).max(2),
});

const readingPaperSchema = z.object({ parts: z.array(partContentSchema).length(3) });
const listeningPaperSchema = z.object({ parts: z.array(partContentSchema).length(4) });

export type PartContent = z.infer<typeof partContentSchema>;
export type WritingSet = z.infer<typeof writingSetSchema>;
export type SpeakingSet = z.infer<typeof speakingSetSchema>;

function cleanJson(text: string): string {
  return text
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

export function parseReadingPaper(text: string): PartContent[] {
  return readingPaperSchema.parse(JSON.parse(cleanJson(text))).parts;
}

export function parseListeningPaper(text: string): PartContent[] {
  return listeningPaperSchema.parse(JSON.parse(cleanJson(text))).parts;
}

export function parseWritingSet(text: string): WritingSet {
  return writingSetSchema.parse(JSON.parse(cleanJson(text)));
}

export function parseSpeakingSet(text: string): SpeakingSet {
  return speakingSetSchema.parse(JSON.parse(cleanJson(text)));
}

const QUESTION_RULES = `Question type rules:
- TRUE_FALSE_NG: correctAnswer must be exactly "TRUE", "FALSE" or "NOT GIVEN".
- MCQ: provide exactly 4 options; correctAnswer must be the exact text of the correct option.
- FILL_BLANK: correctAnswer is a short word or phrase taken from the text; if a natural alternate spelling exists, separate with "|" (e.g. "25|twenty-five").
Mix the types within each part. Never copy real IELTS material - everything must be original.`;

const PAPER_JSON_SHAPE = `{
  "parts": [
    {
      "title": string,
      "bodyText": string,
      "questions": [
        { "type": "MCQ" | "TRUE_FALSE_NG" | "FILL_BLANK", "promptText": string, "options": string[] (only for MCQ, omit otherwise), "correctAnswer": string }
      ]
    }
  ]
}`;

const READING_TOPICS = `artificial intelligence, climate adaptation, remote work, renewable energy, urban biodiversity, social media and society, space exploration, telemedicine, the gig economy, sustainable agriculture, digital privacy, online education, ocean plastics, ancient trade routes, sleep science, vertical farming`;

/** One call produces the whole 3-passage paper; the free tier allows only 5 requests/minute. */
export const READING_GEN_PROMPT = `You are an IELTS Academic Reading test writer. Write a complete 3-passage Academic Reading paper. Passages get progressively longer and harder, exactly as in the real exam:

- Passage 1: 400-500 words, the most accessible - factual and descriptive, for a general audience. Exactly 10 questions.
- Passage 2: 450-550 words, moderately challenging, with some analysis and expert opinion. Exactly 10 questions.
- Passage 3: 500-600 words, the most demanding - abstract and argumentative, with complex sentences and academic vocabulary. Exactly 10 questions.

Each passage must be on a DIFFERENT topic, chosen from: ${READING_TOPICS}. Give each passage a short academic title. Every question must be answerable strictly from its own passage.

${QUESTION_RULES}

Respond with ONLY a single valid JSON object matching exactly this shape, with exactly 3 items in "parts" (in order: Passage 1, 2, 3), no markdown fences, no commentary:
${PAPER_JSON_SHAPE}`;

/** One call produces all four sections, following the real exam's fixed contexts. */
export const LISTENING_GEN_PROMPT = `You are an IELTS Listening test writer. Write a complete 4-section Listening paper. Each section must follow the real exam's fixed context:

- Section 1: a transactional conversation between two speakers in an everyday social context (booking, registration, enquiry). Write it as a dialogue. Include concrete details - names, phone numbers, prices, dates, room numbers - so questions can test form-filling.
- Section 2: a monologue in an everyday social context (a guided tour, a talk about a local facility, event instructions). Include specific facilities, times, locations and arrangements.
- Section 3: a conversation between two or three speakers in an academic context (students and a tutor discussing an assignment or project). Include opinions and decisions.
- Section 4: an academic monologue - a short university-style lecture on a specific subject, with clear structure and supporting detail.

Each script must be 280-380 words, written exactly as it would be spoken aloud. It will be read by a text-to-speech voice, so use no stage directions and write speaker labels as "Name:". Give each section a short descriptive title. Write exactly 10 questions per section, answerable strictly from that section's script.

${QUESTION_RULES}

Respond with ONLY a single valid JSON object matching exactly this shape, with exactly 4 items in "parts" (in order: Section 1, 2, 3, 4), no markdown fences, no commentary:
${PAPER_JSON_SHAPE}`;

export const WRITING_GEN_PROMPT = `You are an IELTS Writing test writer. Generate exactly 2 original writing tasks that together form one complete IELTS Academic Writing paper:

1. Task 1 (taskType "TASK1", minWords 150): an Academic Task 1 based on a chart. Provide the underlying data in the "chart" field so a real diagram can be drawn for the candidate. The prompt text must follow the standard wording, e.g. "The chart below shows ... Summarise the information by selecting and reporting the main features, and make comparisons where relevant." Do NOT repeat the raw numbers inside the prompt text - they belong only in the "chart" field.
2. Task 2 (taskType "TASK2", minWords 250): an opinion, discussion or problem/solution essay on a contemporary topic (technology, education, environment, urbanisation, work-life balance, health, social issues).

For the "chart" field use: type "bar" (comparison across categories), "line" (change over time), "pie" (proportions of one whole - then use exactly one series), or "table". Use 2-6 categories and 1-3 series, with realistic round-ish numbers.

Respond with ONLY a single valid JSON object matching exactly this shape, no markdown fences, no commentary:
{
  "tasks": [
    {
      "title": string,
      "taskType": "TASK1" | "TASK2",
      "minWords": number,
      "prompt": string,
      "chart": { "type": "bar" | "line" | "pie" | "table", "title": string, "unit": string, "categories": string[], "series": [{ "name": string, "values": number[] }] }
    }
  ]
}
The first task must be the TASK1 (with "chart"), the second must be the TASK2 (omit "chart"). Every series' "values" array must have exactly the same length as "categories".`;

export const SPEAKING_GEN_PROMPT = `You are an IELTS Speaking test writer. Generate 2 completely original speaking topic sets, each covering Part 1, Part 2, and Part 3, on contemporary everyday themes - pick two different overall themes from: technology & daily life, travel & culture, work & study, hobbies & free time, environment & community.

For each set:
- Part 1: an intro line plus exactly 3 short follow-up questions on an everyday topic related to the theme.
- Part 2: a cue card intro line (e.g. "Describe a ...") plus exactly 4 bullet points the candidate should cover (no leading dashes in the text).
- Part 3: an intro line plus exactly 3 more abstract discussion questions related to the Part 2 topic.

Respond with ONLY a single valid JSON object matching exactly this shape, no markdown fences, no commentary:
{
  "sets": [
    {
      "title": string,
      "part1": { "promptText": string, "followUps": string[] },
      "part2": { "promptText": string, "followUps": string[] },
      "part3": { "promptText": string, "followUps": string[] }
    }
  ]
}`;
