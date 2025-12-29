export async function onRequest({ env, params }) {
  const url = new URL("https://internal");
  url.searchParams.set("content_id", params.id);
  url.searchParams.set("type", "image");

  return env.HQ.fetch(url, {
    headers: {
      "x-hfw-issue-key": env.ISSUE_KEY
    }
  });
}