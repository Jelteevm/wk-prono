import Link from "next/link";

export default function Home() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#A30000" }}
    >
      <div className="flex w-full max-w-lg flex-col items-center">
        <div className="mb-4 w-full">
          <img
            src="/kdb6.svg"
            alt="Daar issem 2026"
            className="w-full"
          />
        </div>

        <div className="flex w-full flex-col gap-4">
          <Link
            href="/register"
            className="w-full rounded-xl py-4 text-xl font-bold text-black text-center"
            style={{ backgroundColor: "#FCEA10" }}
          >
            Registreren
          </Link>

          <Link
            href="/login"
            className="w-full rounded-xl py-4 text-xl font-bold text-black text-center"
            style={{ backgroundColor: "#FCEA10" }}
          >
            Aanmelden
          </Link>
        </div>
      </div>
    </main>
  );
}

