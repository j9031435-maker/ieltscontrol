import type { Question } from "@prisma/client";

type AnswerMap = Record<string, string>;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, "")
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ");
}

export function gradeAnswer(question: Question, userAnswer: string | undefined): boolean {
  if (!userAnswer) return false;
  const normalizedUser = normalize(userAnswer);
  const alternatives = question.correctAnswer.split("|").map(normalize);
  return alternatives.includes(normalizedUser);
}

export interface QuestionResult {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  correctAnswer: string;
}

export function gradeTest(questions: Question[], answers: AnswerMap) {
  const details: QuestionResult[] = questions.map((q) => {
    const userAnswer = answers[q.id];
    const correct = gradeAnswer(q, userAnswer);
    return {
      questionId: q.id,
      userAnswer: userAnswer ?? "",
      correct,
      correctAnswer: q.correctAnswer.split("|")[0],
    };
  });
  const rawScore = details.filter((d) => d.correct).length;
  return { details, rawScore, total: questions.length };
}
