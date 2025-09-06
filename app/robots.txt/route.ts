export function GET() {
  return new Response(
    `User-agent: *
Allow: /
Sitemap: https://aqua.studio/sitemap.xml`,
    { 
      headers: { "Content-Type": "text/plain" } 
    }
  );
}
