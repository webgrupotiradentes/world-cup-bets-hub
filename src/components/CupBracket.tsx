import { CupBracketMatch } from "@/types/bolao";
import { useMatches, useAllBets, useCupBracketMatches } from "@/hooks/use-bolao-data";
import { calculateScore } from "@/lib/scoring";
import { Participant } from "@/types/bolao";
import { stageLabels } from "@/lib/supabase-queries";

const bracketScoringStages: Record<string, string[]> = {
  "quarter-final": ["round-of-32", "round-of-16"],
  "semi-final": ["quarter-final", "semi-final"],
  "final": ["third-place", "final"],
  "third-place": ["third-place", "final"],
};

function BracketMatchCard({ match, matches, bets }: { match: CupBracketMatch; matches: any[]; bets: any[] }) {
  const wcStages = bracketScoringStages[match.stage] ?? [];

  function getPointsForStages(participant: Participant | undefined): number {
    if (!participant) return 0;
    const stageMatchIds = matches.filter((m: any) => wcStages.includes(m.stage)).map((m: any) => m.id);
    return stageMatchIds.reduce((sum: number, matchId: string) => {
      const m = matches.find((x: any) => x.id === matchId);
      const bet = bets.find((b: any) => b.matchId === matchId && b.participantId === participant.id);
      if (!m?.played || !bet || m.homeScore === undefined || m.awayScore === undefined) return sum;
      const result = calculateScore(bet.homeScore, bet.awayScore, m.homeScore, m.awayScore);
      return sum + result.points;
    }, 0);
  }

  const p1Points = getPointsForStages(match.participant1);
  const p2Points = getPointsForStages(match.participant2);
  const hasPoints = p1Points > 0 || p2Points > 0;
  const displayScore1 = match.score1 !== undefined ? match.score1 : (hasPoints ? p1Points : undefined);
  const displayScore2 = match.score2 !== undefined ? match.score2 : (hasPoints ? p2Points : undefined);

  return (
    <div className="glass rounded-lg p-3 w-56 space-y-1">
      <div className="text-[10px] text-muted-foreground mb-1 truncate">
        {wcStages.length > 0 && `Pts: ${wcStages.map((s) => stageLabels[s] || s).join(" + ")}`}
      </div>
      <div className={`flex items-center justify-between p-1.5 rounded ${match.winner?.id === match.participant1?.id ? "bg-primary/10" : ""}`}>
        <span className="text-sm font-medium truncate">{match.participant1?.name || "A definir"}</span>
        <span className="text-sm font-bold ml-2">{displayScore1 !== undefined ? displayScore1 : "-"}</span>
      </div>
      <div className={`flex items-center justify-between p-1.5 rounded ${match.winner?.id === match.participant2?.id ? "bg-primary/10" : ""}`}>
        <span className="text-sm font-medium truncate">{match.participant2?.name || "A definir"}</span>
        <span className="text-sm font-bold ml-2">{displayScore2 !== undefined ? displayScore2 : "-"}</span>
      </div>
    </div>
  );
}

export function CupBracket() {
  const { data: bracketMatches = [] } = useCupBracketMatches();
  const { data: matches = [] } = useMatches();
  const { data: bets = [] } = useAllBets();

  const quarters = bracketMatches.filter((m) => m.stage === "quarter-final");
  const semis = bracketMatches.filter((m) => m.stage === "semi-final");
  const final = bracketMatches.find((m) => m.stage === "final");
  const thirdPlace = bracketMatches.find((m) => m.stage === "third-place");

  if (bracketMatches.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum chaveamento cadastrado ainda</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px] flex items-center gap-8 py-8">
        <div className="space-y-4">
          <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quartas</h3>
          <div className="space-y-6">
            {quarters.map((m) => <BracketMatchCard key={m.id} match={m} matches={matches} bets={bets} />)}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-24 text-border">
          {[0, 1].map((i) => <div key={i} className="w-8 h-24 border-r-2 border-t-2 border-b-2 border-border rounded-r-lg" />)}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">Semifinais</h3>
          <div className="space-y-24">
            {semis.map((m) => <BracketMatchCard key={m.id} match={m} matches={matches} bets={bets} />)}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="w-8 h-40 border-r-2 border-t-2 border-b-2 border-border rounded-r-lg" />
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-heading font-semibold text-primary uppercase tracking-wider mb-3">🏆 Final</h3>
            {final && <BracketMatchCard match={final} matches={matches} bets={bets} />}
          </div>
          <div>
            <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">3º Lugar</h3>
            {thirdPlace && <BracketMatchCard match={thirdPlace} matches={matches} bets={bets} />}
          </div>
        </div>
      </div>
    </div>
  );
}
