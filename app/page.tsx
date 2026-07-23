import Link from "next/link";

export default function Home() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "linear-gradient(180deg, #163B68 0%, #123D70 100%)" }}

     
    >
      <div className="flex w-full max-w-lg flex-col items-center">
        <div className="mb-4 w-full">
          <img
            src="/kdb5.svg"
            alt="Daar issem 2026"
            className="w-full"
          />
        </div>

        <div className="flex w-full flex-col gap-4">
          <Link
  href="/register"
  className="w-full rounded-xl py-4 text-xl font-bold text-white text-center"
  style={{
    backgroundColor: "#1d406a",
    border: "2px solid #C9A13C",
    boxShadow: "0 4px 12px rgba(201, 161, 60, 0.35)",
  }}
>
  Registreren
</Link>


          <Link
  href="/login"
  className="w-full rounded-xl py-4 text-xl font-bold text-white text-center"
  style={{
    backgroundColor: "#1d406a",
    border: "2px solid #C9A13C",
    boxShadow: "0 4px 12px rgba(201, 161, 60, 0.35)",
  }}
>
  Aanmelden
</Link>
        </div>
      </div>
    </main>
  );
}

