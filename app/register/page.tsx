export default async function RegisterPage({ searchParams }: any) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#A30000" }}
    >
      <form
        action="/api/register"
        method="POST"
        className="w-full max-w-sm rounded-2xl bg-white p-6"
      >
        <h1 className="mb-6 text-center text-3xl font-black text-black">
          Registreren
        </h1>

        <input
          name="username"
          type="text"
          placeholder="Gebruikersnaam"
          required
          className="mb-4 w-full rounded-xl border px-4 py-4 text-black"
        />

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
          minLength={6}
          required
          className="mb-6 w-full rounded-xl border px-4 py-4 text-black"
        />

        <button
          type="submit"
          className="w-full rounded-xl py-4 text-xl font-bold text-black"
          style={{ backgroundColor: "#FCEA10" }}
        >
          Registreren
        </button>

        {error && (
          <p className="mt-4 text-center font-bold text-red-700">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}