import { prisma } from "@/lib/prisma";
import { computeOverallBand } from "@/lib/scoring/bandConversion";
import type { Attempt, Section } from "@prisma/client";

export const SECTIONS: Section[] = ["READING", "LISTENING", "WRITING", "SPEAKING"];

export interface UserResults {
  latestBySection: Partial<Record<Section, Attempt>>;
  overallBand: number | null;
}

export async function getUserResults(userId: string): Promise<UserResults> {
  const attempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const latestBySection: Partial<Record<Section, Attempt>> = {};
  for (const a of attempts) {
    if (!latestBySection[a.section]) latestBySection[a.section] = a;
  }

  const bands = SECTIONS.map((s) => latestBySection[s]?.bandScore).filter(
    (b): b is number => typeof b === "number"
  );
  const overallBand = bands.length === SECTIONS.length ? computeOverallBand(bands) : null;

  return { latestBySection, overallBand };
}

export async function getAllUserResults(): Promise<Map<string, UserResults>> {
  const attempts = await prisma.attempt.findMany({ orderBy: { createdAt: "desc" } });
  const map = new Map<string, UserResults>();

  for (const a of attempts) {
    let entry = map.get(a.userId);
    if (!entry) {
      entry = { latestBySection: {}, overallBand: null };
      map.set(a.userId, entry);
    }
    if (!entry.latestBySection[a.section]) {
      entry.latestBySection[a.section] = a;
    }
  }

  for (const entry of map.values()) {
    const bands = SECTIONS.map((s) => entry.latestBySection[s]?.bandScore).filter(
      (b): b is number => typeof b === "number"
    );
    entry.overallBand = bands.length === SECTIONS.length ? computeOverallBand(bands) : null;
  }

  return map;
}
