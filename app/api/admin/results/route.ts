import { createClient } from "@supabase/supabase-js";

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!adminProfile?.is_admin) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/dashboard" },
    });
  }

  const actualWorldCupWinner = String(
    formData.get("actual_world_cup_winner") || ""
  ).trim();

  const actualTopScorer = String(formData.get("actual_top_scorer") || "").trim();

  await supabase.from("app_settings").upsert(
    [
      { key: "actual_world_cup_winner", value: actualWorldCupWinner },
      { key: "actual_top_scorer", value: actualTopScorer },
    ],
    { onConflict: "key" }
  );

  const { data: matches } = await supabase
    .from("matches")
    .select("id, home_team, away_team")
    .order("id", { ascending: true });

  const filledResults =
    matches?.flatMap((match) => {
      const homeValue = formData.get(`home_${match.id}`);
      const awayValue = formData.get(`away_${match.id}`);

      if (homeValue === null || awayValue === null) return [];
      if (String(homeValue) === "" || String(awayValue) === "") return [];

      return [
        {
          match_id: match.id,
          match_name: `${match.home_team} - ${match.away_team}`,
          home_team: match.home_team,
          away_team: match.away_team,
          home_score: Number(homeValue),
          away_score: Number(awayValue),
        },
      ];
    }) || [];

  if (filledResults.length > 0) {
    await supabase.from("match_results").upsert(filledResults, {
      onConflict: "match_id",
    });
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, world_cup_winner, top_scorer");

  const { data: predictions } = await supabase
    .from("predictions")
    .select("user_id, match_id, result_pick, home_score, away_score");

  const { data: results } = await supabase
    .from("match_results")
    .select("match_id, home_score, away_score");

  for (const profile of profiles || []) {
    let points = 0;

    const userPredictions =
      predictions?.filter((prediction) => prediction.user_id === profile.id) ||
      [];

    for (const prediction of userPredictions) {
      const result = results?.find(
        (result) => Number(result.match_id) === Number(prediction.match_id)
      );

      if (!result) continue;

      const predictedHome = Number(prediction.home_score);
      const predictedAway = Number(prediction.away_score);
      const actualHome = Number(result.home_score);
      const actualAway = Number(result.away_score);

      const actualPick =
        actualHome > actualAway ? "1" : actualHome < actualAway ? "2" : "X";

      if (predictedHome === actualHome && predictedAway === actualAway) {
        points += 2;
      }

      if (prediction.result_pick === actualPick) {
        points += 1;
      }
    }

    if (
      actualWorldCupWinner &&
      profile.world_cup_winner === actualWorldCupWinner
    ) {
      points += 6;
    }

    if (
      actualTopScorer &&
      profile.top_scorer?.toLowerCase().trim() ===
        actualTopScorer.toLowerCase().trim()
    ) {
      points += 4;
    }

    await supabase.from("profiles").update({ points }).eq("id", profile.id);
  }

  return new Response(null, {
    status: 303,
    headers: { Location: "/admin?saved=1" },
  });
}