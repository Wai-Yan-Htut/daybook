import { proxyToBackend } from "@/lib/backend";

export function GET() {
  return proxyToBackend("/api/tasks");
}

export async function POST(request: Request) {
  return proxyToBackend("/api/tasks", {
    method: "POST",
    headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
    body: await request.text(),
  });
}
