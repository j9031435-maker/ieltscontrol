import { z } from "zod";

const questionSchema = z.object({
  type: z.enum(["MCQ", "TRUE_FALSE_NG", "FILL_BLANK"]),
  promptText: z.string().min(3),
  options: z.array(z.string().min(1)).min(2).max(6).optional(),
  correctAnswer: z.string().min(1),
});

const testContentSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  bodyText: z.string().min(80),
  questions: z.array(questionSchema).min(6).max(10),
});

const testSetSchema = z.object({
  tests: z.array(testContentSchema).min(2).max(2),
});

const writingTaskSchema = z.object({
  title: z.string().min(2),
  taskType: z.enum(["TASK1", "TASK2"]),
  minWords: z.number().int().min(120).max(300),
  prompt: z.string().min(30),
});

const writingSetSchema = z.object({
  tasks: z.array(writingTaskSchema).min(3).max(3),
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

export type TestContent = z.infer<typeof testContentSchema>;
export type TestSet = z.infer<typeof testSetSchema>;
export type WritingSet = z.infer<typeof writingSetSchema>;
export type SpeakingSet = z.infer<typeof speakingSetSchema>;

function cleanJson(text: string): string {
  return text
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

export function parseTestSet(text: string): TestSet {
  return testSetSchema.parse(JSON.parse(cleanJson(text)));
}

export function parseWritingSet(text: string): WritingSet {
  return writingSetSchema.parse(JSON.parse(cleanJson(text)));
}

export function parseSpeakingSet(text: string): SpeakingSet {
  return speakingSetSchema.parse(JSON.parse(cleanJson(text)));
}

const JSON_SHAPE_TEST_SET = `{
  "tests": [
    {
      "title": string,
      "description": string,
      "bodyText": string,
      "questions": [
        { "type": "MCQ" | "TRUE_FALSE_NG" | "FILL_BLANK", "promptText": string, "options": string[] (only for MCQ, omit otherwise), "correctAnswer": string }
      ]
    }
  ]
}`;

export const READING_GEN_PROMPT = `You are an IELTS Academic Reading test writer. Generate 2 completely original reading passages (never copy real IELTS material) on contemporary, exam-likely topics — pick two different topics from: artificial intelligence, climate change, remote work, renewable energy, urban biodiversity, social media's impact on society, space exploration, telemedicine, the gig economy, sustainable agriculture, digital privacy, online education. Each passage must be 300-420 words of formal academic English.

For each passage, write exactly 8 questions total, mixing these types: TRUE_FALSE_NG (correctAnswer is exactly "TRUE", "FALSE", or "NOT GIVEN"), MCQ (4 options, correctAnswer is the exact text of the correct option), FILL_BLANK (correctAnswer is a short word/phrase from the passage; if natural alternates exist, separate with "|", e.g. "25|twenty-five").

Respond with ONLY a single valid JSON object matching exactly this shape, no markdown fences, no commentary:
${JSON_SHAPE_TEST_SET}`;

export const LISTENING_GEN_PROMPT = `You are an IELTS Listening test writer. Generate 2 completely original spoken monologue scripts (written as if read aloud by a narrator) in the style of IELTS Listening Section 1 (form-filling in everyday situations like registrations, bookings, orientations) or Section 3/4 (informational talks). Pick modern, exam-likely situations such as: community center registration, library orientation, gym membership signup, workshop booking, campus tour, volunteer program registration. Each script must be 250-350 words and mention specific concrete details (numbers, names, dates, room numbers, prices) that can become questions.

For each script, write exactly 8 questions, mixing: FILL_BLANK (short answer from the script; use "|" for acceptable alternates, e.g. "25|twenty-five"), MCQ (4 options), TRUE_FALSE_NG.

Respond with ONLY a single valid JSON object matching exactly this shape, no markdown fences, no commentary:
${JSON_SHAPE_TEST_SET}`;

export const WRITING_GEN_PROMPT = `You are an IELTS Writing test writer. Generate 3 completely original writing tasks: exactly 1 Task 1 (Academic — describing data; embed a small data table directly as plain text within the prompt, e.g. percentages or numbers across categories/years) and exactly 2 Task 2 (opinion/discussion essays) on contemporary, exam-likely topics (technology, education, environment, urbanization, work-life balance, social issues) — use two different topics for the two Task 2 prompts.

Respond with ONLY a single valid JSON object matching exactly this shape, no markdown fences, no commentary:
{
  "tasks": [
    { "title": string, "taskType": "TASK1" | "TASK2", "minWords": number (150 for Task1, 250 for Task2), "prompt": string }
  ]
}
The first task must have taskType "TASK1", the other two must have taskType "TASK2".`;

export const SPEAKING_GEN_PROMPT = `You are an IELTS Speaking test writer. Generate 2 completely original speaking topic sets, each covering Part 1, Part 2, and Part 3, on contemporary everyday themes — pick two different overall themes from: technology & daily life, travel & culture, work & study, hobbies & free time, environment & community.

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
