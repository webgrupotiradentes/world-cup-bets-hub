import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchTeams,
  fetchMatches,
  fetchParticipants,
  fetchBets,
  fetchCupBracketMatches,
  computeParticipantPoints,
} from "@/lib/supabase-queries";

export function useTeams() {
  return useQuery({ queryKey: ["teams"], queryFn: fetchTeams });
}

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const teams = await fetchTeams();
      return fetchMatches(teams);
    },
  });
}

export function useParticipants() {
  return useQuery({ queryKey: ["participants"], queryFn: fetchParticipants });
}

export function useBets(participantId?: string) {
  return useQuery({
    queryKey: ["bets", participantId],
    queryFn: () => fetchBets(participantId),
  });
}

export function useAllBets() {
  return useQuery({
    queryKey: ["bets"],
    queryFn: () => fetchBets(),
  });
}

export function useCupBracketMatches() {
  return useQuery({
    queryKey: ["cup-bracket"],
    queryFn: async () => {
      const participants = await fetchParticipants();
      return fetchCupBracketMatches(participants);
    },
  });
}

export function useParticipantsWithPoints() {
  return useQuery({
    queryKey: ["participants-with-points"],
    queryFn: async () => {
      const [participants, teams] = await Promise.all([
        fetchParticipants(),
        fetchTeams(),
      ]);
      const matches = await fetchMatches(teams);
      const bets = await fetchBets();
      const pointsMap = await computeParticipantPoints(matches, bets);

      return participants.map((p) => ({
        ...p,
        totalPoints: pointsMap.get(p.id) || 0,
        leaguePoints: pointsMap.get(p.id) || 0,
      }));
    },
  });
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (...keys: string[]) => {
    keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  };
}
