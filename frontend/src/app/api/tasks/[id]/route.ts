import { proxyToBackend } from "@/lib/backend";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyToBackend(`/api/tasks/${encodeURIComponent(id)}`);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyToBackend(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
    body: await request.text(),
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyToBackend(`/api/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
}
