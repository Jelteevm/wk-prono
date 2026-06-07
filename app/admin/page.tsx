import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Menu from "../components/menu";

type Match = {
  id: number;
  speeldag: string | null;
  match_date: string;
  match_time: string | null;
  home_team: string;
  away_team: string;
  fixture_id: number | null;
};

type Result = {
  match_id: number;
  home_score: number | null;
  away_score: number | null;
};

type Team = {
  id: number;
  name: string;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    fixtures_synced?: string;
    results_synced?: string;
  }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let username = "Speler";

  if (!userId) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#A30000",
          color: "white",
          padding: 32,
        }}
      >
        <h1>Geen toegang</h1>
        <p>Je moet eerst aanmelden.</p>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, is_admin")
    .eq("id", userId)
    .single();

  username = profile?.username || "Speler";

  if (!profile?.is_admin) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#A30000",
          color: "white",
          padding: 32,
        }}
      >
        <h1>Geen toegang</h1>
        <p>Alleen de beheerder kan deze pagina bekijken.</p>
      </main>
    );
  }

  const { data: matchesData } = await supabase
    .from("matches")
    .select(
      "id, speeldag, match_date, match_time, home_team, away_team, fixture_id"
    )
    .order("id", { ascending: true });

  const { data: resultsData } = await supabase
    .from("match_results")
    .select("*");

  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: settingsData } = await supabase.from("app_settings").select("*");

  const matches: Match[] = matchesData || [];
  const results: Result[] = resultsData || [];
  const teams: Team[] = teamsData || [];

  const syncedCount = matches.filter((match) => match.fixture_id).length;

  const actualWinner =
    settingsData?.find((setting) => setting.key === "actual_world_cup_winner")
      ?.value || "";

  const actualTopScorer =
    settingsData?.find((setting) => setting.key === "actual_top_scorer")
      ?.value || "";

  function getResult(matchId: number) {
    return results.find((result) => result.match_id === matchId);
  }

  return (
    <main
      className="min-h-screen px-6 py-8 text-white"
      style={{ backgroundColor: "#A30000" }}
    >
      <div className="mx-auto max-w-md">
        <div style={{ marginBottom: 20 }}>
          <Menu username={username} isAdmin={true} />
        </div>

        <h1 className="mb-8 text-center text-3xl font-black">👑 Admin</h1>

        <form action="/api/admin/sync-results" method="POST">
          <button
            type="submit"
            className="mb-6 w-full rounded-xl py-4 text-xl font-bold text-black"
            style={{ backgroundColor: "#4ADE80" }}
          >
            ⚽ Uitslagen synchroniseren
          </button>
        </form>

        {params.saved && (
          <p className="mb-4 rounded-xl bg-green-100 p-3 text-center font-bold text-green-800">
            Opgeslagen en punten herberekend!
          </p>
        )}

        {params.fixtures_synced !== undefined && (
          <p className="mb-4 rounded-xl bg-green-100 p-3 text-center font-bold text-green-800">
            Fixture IDs gesynchroniseerd: {params.fixtures_synced}
          </p>
        )}

        {params.results_synced !== undefined && (
          <p className="mb-4 rounded-xl bg-green-100 p-3 text-center font-bold text-green-800">
            Uitslagen gesynchroniseerd: {params.results_synced}
          </p>
        )}

        <div className="mb-6 rounded-2xl bg-white p-5 text-center text-black">
          <div className="text-sm font-black text-gray-500">
            Fixture koppeling
          </div>
          <div className="mt-1 text-2xl font-black">
            {syncedCount} / {matches.length}
          </div>
          <div className="text-sm font-bold text-gray-500">
            wedstrijden gekoppeld aan API-Football
          </div>
        </div>

        <form action="/api/admin/sync-fixtures" method="POST">
          <button
            type="submit"
            className="mb-6 w-full rounded-xl py-4 text-xl font-bold text-black"
            style={{ backgroundColor: "#FCEA10" }}
          >
            🔄 Fixture IDs synchroniseren
          </button>
        </form>

        <form action="/api/admin/results" method="POST">
          <div className="mb-6 rounded-2xl bg-white p-6 text-black">
            <h2 className="mb-5 text-center text-2xl font-black">
              🏆 Eindbonussen
            </h2>

            <label className="mb-2 block text-sm font-black text-gray-500">
              Echte WK winnaar
            </label>

            <select
              name="actual_world_cup_winner"
              defaultValue={actualWinner}
              className="mb-5 w-full rounded-xl border p-3 text-center text-lg font-bold"
            >
              <option value="">Nog niet ingevuld</option>
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>

            <label className="mb-2 block text-sm font-black text-gray-500">
              Echte topschutter
            </label>

            <input
              name="actual_top_scorer"
              type="text"
              defaultValue={actualTopScorer}
              placeholder="Bijvoorbeeld Mbappé"
              className="w-full rounded-xl border p-3 text-center text-lg font-bold"
            />
          </div>

          <div className="flex flex-col gap-5">
            {matches.map((match) => {
              const result = getResult(match.id);

              return (
                <div
                  key={match.id}
                  className="rounded-2xl bg-white p-6 text-black"
                >
                  <div className="mb-3 text-center text-sm font-black text-gray-500">
                    {match.speeldag} — {match.match_date}{" "}
                    {match.match_time || ""}
                  </div>

                  <div className="mb-2 text-center text-xs font-black text-gray-400">
                    API fixture: {match.fixture_id || "nog niet gekoppeld"}
                  </div>

                  <h2 className="mb-5 text-center text-2xl font-black">
                    {match.home_team} - {match.away_team}
                  </h2>

                  <div className="flex items-center justify-center gap-4">
                    <input
                      name={`home_${match.id}`}
                      type="number"
                      min="0"
                      defaultValue={result?.home_score ?? ""}
                      className="w-20 rounded-xl border p-3 text-center text-xl"
                    />

                    <span className="text-2xl font-bold">-</span>

                    <input
                      name={`away_${match.id}`}
                      type="number"
                      min="0"
                      defaultValue={result?.away_score ?? ""}
                      className="w-20 rounded-xl border p-3 text-center text-xl"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl py-4 text-xl font-bold text-black"
            style={{ backgroundColor: "#FCEA10" }}
          >
            Alles opslaan en punten herberekenen
          </button>
        </form>
      </div>
    </main>
  );
}