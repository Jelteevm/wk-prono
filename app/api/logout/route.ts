export async function POST() {
  const headers = new Headers();

  headers.append("Location", "/login");

  headers.append(
    "Set-Cookie",
    "username=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );

  headers.append(
    "Set-Cookie",
    "user_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );

  return new Response(null, {
    status: 303,
    headers,
  });
}