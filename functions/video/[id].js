export async function onRequest({ request, env, params }) {
  const url = new URL("https://internal");
  url.searchParams.set("content_id", params.id);
  url.searchParams.set("type", "video");

  return env.HQ.fetch(url, {
    headers: {
      "x-hfw-issue-key": env.ISSUE_KEY,
      // Range ヘッダは必ず引き継ぐ
      ...(request.headers.get("range")
        ? { range: request.headers.get("range") }
        : {})
    }
  });
}