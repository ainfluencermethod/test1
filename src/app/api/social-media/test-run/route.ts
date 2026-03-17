import { NextResponse } from "next/server";
import { exec } from "child_process";

let runningProcess: ReturnType<typeof exec> | null = null;
let isRunning = false;
let lastOutput = "";
let lastExitCode: number | null = null;

export async function POST() {
  if (isRunning) {
    return NextResponse.json(
      { error: "A test run is already in progress", status: "running" },
      { status: 409 }
    );
  }

  isRunning = true;
  lastOutput = "";
  lastExitCode = null;

  return new Promise<Response>((resolve) => {
    runningProcess = exec(
      "cd /Users/jarvis/.openclaw/workspace/tools/social-media-manager && MIN_DURATION=60 MAX_DURATION=60 node warmup-session.js",
      { timeout: 120_000 },
      (error, stdout, stderr) => {
        isRunning = false;
        runningProcess = null;

        if (error) {
          lastExitCode = error.code ?? 1;
          lastOutput = `Error: ${error.message}\n${stdout || ""}\n${stderr || ""}`;
        } else {
          lastExitCode = 0;
          lastOutput = stdout || stderr || "";
        }
      }
    );

    // Respond immediately - the process runs in background
    resolve(
      NextResponse.json({
        status: "started",
        message: "Test run started. Poll GET /api/social-media/test-run for status.",
      })
    );
  });
}

export async function GET() {
  return NextResponse.json({
    isRunning,
    lastOutput: lastOutput.slice(-500),
    pid: runningProcess?.pid || null,
    exitCode: lastExitCode,
  });
}
