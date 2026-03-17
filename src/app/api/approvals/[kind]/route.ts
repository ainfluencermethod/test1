import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ALLOWED_KINDS = new Set(["email", "whatsapp"]);

type ApprovalMap = Record<string, unknown>;

function getApprovalFile(kind: string) {
  return path.join(process.cwd(), "data", "approvals", `${kind}.json`);
}

async function readApprovals(kind: string): Promise<ApprovalMap> {
  try {
    const raw = await readFile(getApprovalFile(kind), "utf8");
    return JSON.parse(raw);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") return {};
    throw error;
  }
}

async function writeApprovals(kind: string, approvals: ApprovalMap) {
  const filePath = getApprovalFile(kind);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(approvals, null, 2) + "\n", "utf8");
}

function validateKind(kind: string) {
  return ALLOWED_KINDS.has(kind);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ kind: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { kind } = await params;
  if (!validateKind(kind)) {
    return NextResponse.json({ error: "Unknown approval kind" }, { status: 404 });
  }

  const approvals = await readApprovals(kind);
  return NextResponse.json(approvals);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { kind } = await params;
  if (!validateKind(kind)) {
    return NextResponse.json({ error: "Unknown approval kind" }, { status: 404 });
  }

  const approvals = (await req.json()) as ApprovalMap;
  await writeApprovals(kind, approvals || {});
  return NextResponse.json({ ok: true });
}
