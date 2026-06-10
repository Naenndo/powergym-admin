export async function POST() {
  const response = Response.json({ message: "Logout exitoso" });
  response.headers.set(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; Max-Age=0"
  );
  return response;
}
