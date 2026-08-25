import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";

export function packlinkApiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Operazione non riuscita.";
  const status = message === "unauthenticated" ? 401 : message === "forbidden" ? 403 : 400;
  const text =
    message === "unauthenticated"
      ? "Accedi come titolare."
      : message === "forbidden"
        ? "Questa zona è del titolare."
        : message;
  return NextResponse.json({ error: text }, { status: status === 400 && message.length > 0 ? 400 : status });
}

export async function requirePacklinkOwner() {
  await requireOwner();
}
