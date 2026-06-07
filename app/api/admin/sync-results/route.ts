import { createClient } from "@supabase/supabase-js";

function calculatePick(home: number, away: number) {
  if (home > away) return "1";
  if (home < away) return "2";
  return "X";
}

export async function POST(request: Request) {
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

  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return new Response("API_FOOTBALL_KEY ontbreekt.", { status: 500 });
  }

  const { data: matches } = await supabase
    .from("matches")
    .select("id, fixture_id, home_team, away_team")
    .not("fixture_id", "is", null);

  let synced = 0;

  for (const match of matches || []) {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${match.fixture_id}`,
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();
    const fixture = data.response?.[0];

    if (!fixture) continue;

    const status = fixture.fixture?.status?.short;

    const isFinished = ["FT", "AET", "PEN"].includes(status);

    if (!isFinished) continue;

    const homeScore = fixture.goals?.home;
    const awayScore = fixture.goals?.away;

    if (homeScore === null || awayScore === null) continue;

    await supabase.from("match_results").upsert(
      {
        match_id: match.id,
        match_name: `${match.home_team} - ${match.away_team}`,
        home_team: match.home_team,
        away_team: match.away_team,
        home_score: Number(homeScore),
        away_score: Number(awayScore),
      },
      { onConflict: "match_id" }
    );

    synced++;
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

  const { data: settingsData } = await supabase.from("app_settings").select("*");

  const actualWorldCupWinner =
    settingsData?.find((setting) => setting.key === "actual_world_cup_winner")
      ?.value || "";

  const actualTopScorer =
    settingsData?.find((setting) => setting.key === "actual_top_scorer")
      ?.value || "";

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

      if (predictedHome === actualHome && predictedAway === actualAway) {
        points += 2;
      }

      if (prediction.result_pick === calculatePick(actualHome, actualAway)) {
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
    headers: { Location: `/admin?results_synced=${synced}` },
  });
}