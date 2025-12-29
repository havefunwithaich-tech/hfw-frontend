export async function onRequest({ env, params }) {
  const url = new URL("https://internal");
  url.searchParams.set("content_id", params.id);
  url.searchParams.set("type", "image");

return env.HQ.fetch("https://internal", { 
  method: "POST", 
  headers: { 
    "x-hfw-issue-key": env.ISSUE_KEY, 
    "Content-Type": "application/json" 
  }, 
  body: JSON.stringify({ 
    content_id: params.id, 
    type: "image" }) });
}