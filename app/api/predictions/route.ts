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

  const selectedSpeeldag = String(formData.get("speeldag") || "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: deadlineData } = await supabase
    .from("speeldag_deadlines")
    .select("deadline")
    .eq("speeldag", selectedSpeeldag)
    .single();

  if (deadlineData?.deadline) {
    const deadline = new Date(deadlineData.deadline);
    const now = new Date();

    if (now > deadline) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/voorspellingen?error=${encodeURIComponent(
            "Deadline verstreken. Wijzigen is niet meer mogelijk."
          )}`,
        },
      });
    }
  }

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

  const predictions = (matches || []).map((match) => ({
    user_id: userId,
    match_id: match.id,
    match_name: `${match.home_team} - ${match.away_team}`,
    home_team: match.home_team,
    away_team: match.away_team,
    result_pick: String(formData.get(`result_${match.id}`) || "X"),
    home_score: Number(formData.get(`home_${match.id}`) || 0),
    away_score: Number(formData.get(`away_${match.id}`) || 0),
  }));

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

  return new Response(null, {
    status: 303,
    headers: {
      Location: `/voorspellingen?speeldag=${encodeURIComponent(
        selectedSpeeldag
      )}&saved=1`,
    },
  });
}