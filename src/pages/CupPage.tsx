import { Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupTable } from "@/components/GroupTable";
import { CupBracket } from "@/components/CupBracket";
import { CupRounds } from "@/components/CupRounds";
import { useParticipants, useMatches, useAllBets } from "@/hooks/use-bolao-data";
import { computeCupGroupStandings } from "@/hooks/use-bolao-data";

export default function CupPage() {
  const { data: participants = [], isLoading: lp } = useParticipants();
  const { data: matches = [], isLoading: lm } = useMatches();
  const { data: bets = [], isLoading: lb } = useAllBets();

  if (lp || lm || lb) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>;
  }

  const cupGroupStandings = computeCupGroupStandings(participants, matches, bets);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          Copa do Bolão
        </h1>
        <p className="text-muted-foreground mt-1">Fase de grupos, confrontos e mata-mata entre os participantes</p>
      </div>

      <Tabs defaultValue="rounds" className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="rounds">Confrontos</TabsTrigger>
          <TabsTrigger value="groups">Classificação</TabsTrigger>
          <TabsTrigger value="bracket">Chaveamento</TabsTrigger>
        </TabsList>

        <TabsContent value="rounds" className="mt-6">
          <CupRounds />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          {Object.keys(cupGroupStandings).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Cadastre participantes com grupo da copa para ver a classificação</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(cupGroupStandings)
                .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
                .map(([group, standings]) => (
                  <GroupTable key={group} group={group} standings={standings} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bracket" className="mt-6">
          <CupBracket />
        </TabsContent>
      </Tabs>
    </div>
  );
}
