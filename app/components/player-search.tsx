"use client";

import { useMemo, useState } from "react";

type Player = {
  name: string;
};

export default function PlayerSearch({
  players,
  defaultValue = "",
}: {
  players: Player[];
  defaultValue?: string;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!showSuggestions) return [];
    if (query.trim().length < 2) return [];

    return players
      .filter((player) =>
        player.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8);
  }, [query, players, showSuggestions]);

  function choosePlayer(name: string) {
    setQuery(name);
    setShowSuggestions(false);
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        name="top_scorer"
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setShowSuggestions(true);
        }}
        placeholder="Typ bv. Mba..."
        autoComplete="off"
        className="w-full rounded-xl border p-3 text-center text-lg font-bold"
      />

      {suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            zIndex: 9999,
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 6,
            backgroundColor: "white",
            border: "2px solid #FCEA10",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          }}
        >
          {suggestions.map((player) => (
            <button
              key={player.name}
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                choosePlayer(player.name);
              }}
              style={{
                width: "100%",
                border: "none",
                backgroundColor: "white",
                color: "black",
                padding: "14px 16px",
                textAlign: "left",
                fontWeight: 900,
                cursor: "pointer",
                borderBottom: "1px solid rgba(0,0,0,0.1)",
                touchAction: "manipulation",
              }}
            >
              {player.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}