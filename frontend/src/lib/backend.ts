const backendUrl = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");

export async function proxyToBackend(path: string, init?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(`${backendUrl}${path}`, {
      ...init,
      cache: "no-store",
    });

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }
    const location = response.headers.get("location");
    if (location) {
      headers.set("location", location);
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch {
    return Response.json({ error: "Task service is unavailable. Check that the backend is running." }, { status: 503 });
  }
}
