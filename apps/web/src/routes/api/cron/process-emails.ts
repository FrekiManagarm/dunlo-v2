import { createFileRoute } from "@tanstack/react-router";
import { env } from "@dunlo-v2/env/server";
import { processScheduledEmails } from "@/functions/scheduler";

function authorized(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${env.CRON_SECRET}`;
}

async function handle(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const result = await processScheduledEmails();
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/process-emails] error", message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/cron/process-emails")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
