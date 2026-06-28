import { createClient } from "@supabase/supabase-js";

function isTriondaMatch(speeldag: string | null) {
  if (!speeldag) return false;

  const value = speeldag.toLowerCase();

  return (
    value.includes("16e finale") ||
    value.includes("8e finale") ||
    value.includes("kwartfinale") ||
    value.includes("halve finale") ||
    value.includes("verliezersfinale") ||
    value.includes("finale")
  );
}

function isMatchOpen(match: { prediction_deadline: string | null }) {
  if (!match.prediction_deadline) return false;

  return new Date() <= new Date(match.prediction_deadline);
}

function isValidScore(value: FormDataEntryValue | null) {
  if (value === null) return false;

  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue >= 0 && numberValue <= 30;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const userId = request.headers
    .get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith("user_id="))
    ?.split("=")[1];

  if (!userId) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/login" },
    });
  }

  const selectedSpeeldag = String(formData.get("speeldag") || "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (formData.has("world_cup_winner") || formData.has("top_scorer")) {
    const worldCupWinner = String(
      formData.get("world_cup_winner") || ""
    ).trim();

    const topScorer = String(formData.get("top_scorer") || "").trim();

    await supabase
      .from("profiles")
      .update({
        world_cup_winner: worldCupWinner,
        top_scorer: topScorer,
      })
      .eq("id", userId);
  }

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .eq("speeldag", selectedSpeeldag)
    .order("id", { ascending: true });

  const openMatches = (matches || []).filter((match) => isMatchOpen(match));

  const predictions = openMatches.flatMap((match) => {
    const homeValue = formData.get(`home_${match.id}`);
    const awayValue = formData.get(`away_${match.id}`);
    const resultPick = String(formData.get(`result_${match.id}`) || "");

    if (!isValidScore(homeValue) || !isValidScore(awayValue)) {
      return [];
    }

    if (!["1", "X", "2"].includes(resultPick)) {
      return [];
    }

    return [
      {
        user_id: userId,
        match_id: match.id,
        match_name: `${match.home_team} - ${match.away_team}`,
        home_team: match.home_team,
        away_team: match.away_team,
        result_pick: resultPick,
        home_score: Number(homeValue),
        away_score: Number(awayValue),
      },
    ];
  });

  if (predictions.length > 0) {
    const { error } = await supabase.from("predictions").upsert(predictions, {
      onConflict: "user_id,match_id",
    });

    if (error) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/voorspellingen?speeldag=${encodeURIComponent(
            selectedSpeeldag
          )}&error=${encodeURIComponent(error.message)}`,
        },
      });
    }
  }

  const triondaPredictions = openMatches
    .filter((match) => isTriondaMatch(match.speeldag))
    .flatMap((match) => {
      const firstScorer = String(
        formData.get(`trionda_first_scorer_${match.id}`) || ""
      ).trim();

      const yellowCardPlayer = String(
        formData.get(`trionda_yellow_card_${match.id}`) || ""
      ).trim();

      if (!firstScorer && !yellowCardPlayer) {
        return [];
      }

      return [
        {
          user_id: userId,
          match_id: match.id,
          first_scorer: firstScorer,
          yellow_card_player: yellowCardPlayer,
          updated_at: new Date().toISOString(),
        },
      ];
    });

  if (triondaPredictions.length > 0) {
    const { error: triondaError } = await supabase
      .from("trionda_predictions")
      .upsert(triondaPredictions, {
        onConflict: "user_id,match_id",
      });

    if (triondaError) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/voorspellingen?speeldag=${encodeURIComponent(
            selectedSpeeldag
          )}&error=${encodeURIComponent(triondaError.message)}`,
        },
      });
    }
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: `/voorspellingen?speeldag=${encodeURIComponent(
        selectedSpeeldag
      )}&saved=1`,
    },
  });
}