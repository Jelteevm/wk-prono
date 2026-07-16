"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage(`Er ging iets mis: ${error.message}`);
    } else {
      setMessage(
        "Controleer je e-mail. Je ontvangt een link om een nieuw wachtwoord te kiezen."
      );
    }

    setLoading(false);
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#A30000" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-black"
      >
        <h1 className="mb-3 text-center text-3xl font-black">
          Wachtwoord vergeten
        </h1>

        <p className="mb-6 text-center font-bold text-gray-600">
          Vul je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord
          te kiezen.
        </p>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-mailadres"
          required
          className="mb-4 w-full rounded-xl border px-4 py-4 text-black"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-4 text-xl font-bold text-black disabled:opacity-60"
          style={{ backgroundColor: "#FCEA10" }}
        >
          {loading ? "Versturen..." : "Resetmail versturen"}
        </button>

        {message && (
          <p className="mt-5 rounded-xl bg-gray-100 p-3 text-center font-bold">
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="font-bold underline">
            Terug naar aanmelden
          </Link>
        </div>
      </form>
    </main>
  );
}