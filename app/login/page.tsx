export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    registered?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#A30000" }}
    >
      <form
        action="/api/login"
        method="POST"
        className="w-full max-w-sm rounded-2xl bg-white p-6"
      >
        <h1 className="mb-6 text-center text-3xl font-black text-black">
          Aanmelden
        </h1>

        {params.registered && (
          <p className="mb-4 rounded-xl bg-green-100 p-3 text-center font-bold text-green-800">
            Account aangemaakt! Je mag nu aanmelden.
          </p>
        )}

        {params.error && (
          <p className="mb-4 rounded-xl bg-red-100 p-3 text-center font-bold text-red-800">
            {params.error}
          </p>
        )}

        <input
          name="email"
          type="email"
          placeholder="E-mailadres"
          required
          className="mb-4 w-full rounded-xl border px-4 py-4 text-black"
        />

        <input
          name="password"
          type="password"
          placeholder="Wachtwoord"
          required
          className="mb-6 w-full rounded-xl border px-4 py-4 text-black"
        />

        <button
          type="submit"
          className="w-full rounded-xl py-4 text-xl font-bold text-black"
          style={{ backgroundColor: "#FCEA10" }}
        >
          Aanmelden
        </button>

        <div className="mt-6 text-center">
  <a
    href="/forgot-password"
    className="mb-3 block font-bold text-black underline"
  >
    Wachtwoord vergeten?
  </a>

  <a
    href="/register"
    className="font-bold text-black underline"
  >
    Nog geen account? Registreer hier
  </a>
</div>
      </form>
    </main>
  );
}