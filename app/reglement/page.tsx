import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Menu from "../components/menu";

export default async function ReglementPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let username = "Speler";
  let isAdmin = false;
  let avatarUrl = "";

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, is_admin, avatar_url")
      .eq("id", userId)
      .single();

    username = profile?.username || "Speler";
    isAdmin = profile?.is_admin ?? false;
    avatarUrl = profile?.avatar_url || "";
  }

  return (
    <main
  className="min-h-screen text-white"
  style={{ backgroundColor: "#03162E" }}
>
  <Menu username={username} isAdmin={isAdmin} avatarUrl={avatarUrl} />

  <div
    className="mx-auto max-w-md px-6 pb-8"
    style={{ paddingTop: 92 }}
  >
    <div className="rounded-2xl bg-white p-6 text-black shadow-lg">
          <h1 className="mb-6 text-center text-3xl font-black">
            REGLEMENT WK PRONOSTIEK 2026 
          </h1>

          <p className="mb-5 font-bold">
            Hieronder vind je alle regels,
            deadlines en informatie omtrent de prijzenpot.
          </p>

          <h2 className="mb-2 text-xl font-black">1. Voorspellingen</h2>
          <p className="mb-4">
            Voor elke wedstrijd wordt een voorspelling gedaan van 1 - X - 2 en
            de exacte eindscore. Daarnaast voorspelt iedere deelnemer de
            WK-winnaar en de topschutter van het toernooi.
          </p>

          <h2 className="mb-2 text-xl font-black">2. Puntensysteem</h2>
          <p className="mb-2 font-bold">Wedstrijden</p>
          <p>Correcte 1-X-2 voorspelling: <strong>1 punt</strong></p>
          <p className="mb-4">Correcte exacte score: <strong>2 punten</strong></p>

          <p className="mb-2 font-bold">Bonuspunten</p>
          <p>Correct voorspelde WK-winnaar: <strong>6 punten</strong></p>
          <p className="mb-4">Correct voorspelde topschutter: <strong>4 punten</strong> </p>

          <p className="mb-4">
            Indien meerdere spelers het toernooi als gedeelde topschutter
            afsluiten, worden deze allemaal als correcte voorspelling beschouwd.
          </p>

          <h2 className="mb-2 text-xl font-black">3. Knock-outfase</h2>
          <p className="mb-4">
            In de knock-outfase telt de officiële einduitslag na eventuele
            verlengingen. Strafschoppen tellen niet mee.
          </p>

          <h2 className="mb-2 text-xl font-black">4. Wijzigen van voorspellingen</h2>
          <p className="mb-4">
            Voorspellingen kunnen gewijzigd worden tot één uur vóór de start van
            elke speeldag.
          </p>

          <div className="mb-5 rounded-xl bg-gray-100 p-4 font-bold">
            <p>Speeldag 1: 11/06/2026 – 20:00</p>
            <p>Speeldag 2: 18/06/2026 – 17:00</p>
            <p>Speeldag 3: 24/06/2026 – 20:00</p>
            <p>16e finales: 28/06/2026 – 20:00</p>
          </div>

          <h2 className="mb-2 text-xl font-black">5. Inschrijvingsgeld</h2>
          <p className="mb-4">
            Het inschrijvingsgeld bedraagt €30 per deelnemer en dient
            overgeschreven te worden op:
          </p>

          <div className="mb-4 rounded-xl bg-yellow-300 p-4 text-center text-xl font-black">
            BE10 0635 1055 6404
          </div>

          <p className="mb-5 italic">
            Gelieve de betaling niet uit te stellen (Thias)
          </p>

          <h2 className="mb-2 text-xl font-black">6. Prijzengeld</h2>
          <div className="mb-5 rounded-xl bg-gray-100 p-4 font-bold">
            <p>1e plaats: €250</p>
            <p>2e plaats: €180</p>
            <p>3e plaats: €130</p>
            <p>4e plaats: €90</p>
            <p>5e plaats: €70</p>
          </div>

          <h2 className="mb-2 text-xl font-black">7. Rangschikking</h2>
          <p className="mb-4">
            De deelnemer met het hoogste aantal punten wint. Bij gelijke stand
            wordt gekeken naar wie het dichtst bij het totale aantal doelpunten
            op het WK zit. Al je ingegeven doelpunten worden opgeteld en vergeleken met het werkelijk aantal doelpunten dit WK.
          </p>

          <h2 className="mb-2 text-xl font-black">8. Uitbetaling</h2>
          <p className="mb-6">
            De prijzen worden uitbetaald daags na de WK-finale.
          </p>

          <p className="text-center text-xl font-black">
            Veel succes aan alle deelnemers!
          </p>

          <p className="mt-4 text-center font-bold">
            Dat de beste moge winnen!
          </p>
        </div>
      </div>
    </main>
  );
}
