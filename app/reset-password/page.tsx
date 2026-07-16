"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "✅ Je wachtwoord is aangepast. Je kan nu opnieuw aanmelden."
      );
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#A30000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: 30,
          borderRadius: 20,
          maxWidth: 400,
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>
          Nieuw wachtwoord
        </h1>

        <input
          type="password"
          placeholder="Nieuw wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "1px solid #ccc",
            marginBottom: 20,
            color: "black",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: "#FCEA10",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Wachtwoord opslaan
        </button>

        {message && (
          <p style={{ marginTop: 20, fontWeight: 700 }}>{message}</p>
        )}
      </form>
    </main>
  );
}