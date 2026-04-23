import type { Club, ClubPlayerEntry } from "@/types";

export interface DataProvider {
  name: string;
  searchClubs(query: string): Promise<Club[]>;
  getClubPlayers(clubId: string): Promise<ClubPlayerEntry[]>;
}
