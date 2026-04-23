export interface Club {
  id: string;
  name: string;
  country?: string;
  founded?: number;
  wikidataId?: string;
}

export interface CareerEntry {
  clubId: string;
  clubName: string;
  startDate?: string;
  endDate?: string;
  startYear?: number;
  endYear?: number;
  position?: string;
  appearances?: number;
  goals?: number;
  isLoan?: boolean;
}

export interface Player {
  id: string;
  name: string;
  nationality?: string;
  birthDate?: string;
  birthYear?: number;
  position?: string;
  wikidataId?: string;
  imageUrl?: string;
  careerEntries: CareerEntry[];
}

export interface ClubPlayerEntry {
  player: Player;
  clubEntry: CareerEntry;
}

export interface ComparisonResult {
  clubA: Club;
  clubB: Club;
  playersA: ClubPlayerEntry[];
  playersB: ClubPlayerEntry[];
  commonPlayers: CommonPlayer[];
}

export interface CommonPlayer {
  player: Player;
  entryA: CareerEntry;
  entryB: CareerEntry;
}

export type SortField = "name" | "startDate" | "endDate" | "duration";
export type SortDirection = "asc" | "desc";

export interface FilterOptions {
  onlyCommon: boolean;
  startYearMin?: number;
  startYearMax?: number;
  onlyWithDates: boolean;
}

export interface SearchState {
  clubAQuery: string;
  clubBQuery: string;
  clubA?: Club;
  clubB?: Club;
  result?: ComparisonResult;
  loading: boolean;
  error?: string;
}
