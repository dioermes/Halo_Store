import { NextResponse } from "next/server";
import { requirePacklinkOwner, packlinkApiError } from "@/lib/packlink-api";
import { getPacklinkPoints } from "@/lib/packlink";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requirePacklinkOwner();
    const params = new URL(req.url).searchParams;
    const serviceId = params.get("serviceId") ?? "";
    const zip = (params.get("zip") ?? "").replace(/\s/g, "");
    const country = (params.get("country") ?? "IT").toUpperCase();
    if (!serviceId || !/^\d{5}$/.test(zip)) {
      return NextResponse.json({ error: "Inserisci un CAP di 5 cifre." }, { status: 400 });
    }
    const points = await getPacklinkPoints({ serviceId, country, zip });
    return NextResponse.json({ points });
  } catch (error) {
    return packlinkApiError(error);
  }
}
