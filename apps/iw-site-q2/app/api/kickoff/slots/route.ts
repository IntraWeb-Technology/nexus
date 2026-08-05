import type { NextRequest } from "next/server";
import { handleSlots } from "@/app/api/booking/_shared";

export async function GET(req: NextRequest) {
  return handleSlots(req, "kickoff");
}
