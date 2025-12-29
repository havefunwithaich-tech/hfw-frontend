export async function onRequest({ request, env }) {
  const incoming = new URL(request.url);

  const url = new URL("https://internal");
  incoming.searchParams.forEach((v, k) => {
    url.searchParams.set(k, v);
  });

  return env.HQ.fetch(url, {
    headers: {
      "x-hfw-issue-key": env.ISSUE_KEY
    }
  });
}