import { NextResponse } from "next/server";
import {
  createPhoneVerificationToken,
  verifyPhoneWithVeriphone,
} from "@/lib/phone-verification";

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { phone?: unknown } | null;
  const result = await verifyPhoneWithVeriphone(body?.phone);

  return NextResponse.json({
    ok: result.isValid,
    normalized: result.normalized,
    reason: result.reason || null,
    flags: result.flags,
    veriphone: result.veriphone || null,
    // This proves to /api/lead-iul-v6 that Veriphone already approved this phone.
    verificationToken: result.isValid ? createPhoneVerificationToken(result.normalized) : null,
  });
}
