import { handleObjectiveSubmit } from "@/lib/scoring/submitObjective";

export async function POST(req: Request) {
  return handleObjectiveSubmit(req, "LISTENING");
}
