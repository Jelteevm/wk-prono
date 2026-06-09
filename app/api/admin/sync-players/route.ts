import { createClient } from "@supabase/supabase-js";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/dashboard" },
    });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return new Response("API_FOOTBALL_KEY ontbreekt.", { status: 500 });
  }

  const { data: teams } = await supabase
    .from("teams")
    .select("api_name")
    .not("api_name", "is", null);

  let synced = 0;

  for (const team of teams || []) {
    const teamResponse = await fetch(
      `https://v3.football.api-sports.io/teams?name=${encodeURIComponent(
        team.api_name
      )}`,
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    const teamData = await teamResponse.json();
    const apiTeam = teamData.response?.[0]?.team;

    if (!apiTeam?.id) continue;

    const squadResponse = await fetch(
      `https://v3.football.api-sports.io/players/squads?team=${apiTeam.id}`,
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    const squadData = await squadResponse.json();
    const squad = squadData.response?.[0];

    for (const player of squad?.players || []) {
      const { error } = await supabase.from("players").upsert(
        {
          api_player_id: player.id,
          name: player.name,
          country: squad.team.name,
          team_name: squad.team.name,
          position: player.position,
          photo: player.photo,
        },
        { onConflict: "api_player_id" }
      );

      if (!error) synced++;
    }
  }

  return new Response(null, {
    status: 303,
    headers: { Location: `/admin?players_synced=${synced}` },
  });
}