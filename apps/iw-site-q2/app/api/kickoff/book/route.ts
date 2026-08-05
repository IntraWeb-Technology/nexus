import type { NextRequest } from "next/server";
import { handleBook } from "@/app/api/booking/_shared";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  return handleBook(req, "kickoff");
}
