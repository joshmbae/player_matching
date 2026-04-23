import type { Club, ClubPlayerEntry, CareerEntry, Player } from "@/types";
import type { DataProvider } from "./base";
import { sparqlQuery, sparqlValue, wikidataId, extractYear } from "@/lib/sparql";
import { cache } from "@/lib/cache";

type Binding = Record<string, { value: string } | undefined>;

export class WikidataProvider implements DataProvider {
  name = "Wikidata";

  async searchClubs(query: string): Promise<Club[]> {
    const cacheKey = `clubs:${query.toLowerCase()}`;
    const cached = cache.get<Club[]>(cacheKey);
    if (cached) return cached;

    const escaped = query.replace(/"/g, '\\"');
    const sparql = `
SELECT DISTINCT ?club ?clubLabel ?country ?countryLabel ?founded WHERE {
  SERVICE wikibase:mwapi {
    bd:serviceParam wikibase:endpoint "www.wikidata.org";
                    wikibase:api "EntitySearch";
                    mwapi:search "${escaped}";
                    mwapi:language "en";
                    mwapi:limit "20".
    ?club wikibase:apiOutputItem mwapi:item.
  }
  ?club wdt:P31/wdt:P279* wd:Q476028.
  OPTIONAL { ?club wdt:P17 ?country. }
  OPTIONAL { ?club wdt:P571 ?founded. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
}
LIMIT 15`;

    try {
      const bindings = await sparqlQuery<Binding>(sparql);
      const clubs: Club[] = bindings.map((b) => ({
        id: wikidataId(sparqlValue(b, "club")) ?? sparqlValue(b, "club") ?? "",
        name: sparqlValue(b, "clubLabel") ?? "",
        country: sparqlValue(b, "countryLabel"),
        founded: extractYear(sparqlValue(b, "founded")),
        wikidataId: wikidataId(sparqlValue(b, "club")),
      })).filter((c) => c.id && c.name);

      cache.set(cacheKey, clubs);
      return clubs;
    } catch {
      return [];
    }
  }

  async getClubPlayers(clubId: string): Promise<ClubPlayerEntry[]> {
    const cacheKey = `players:${clubId}`;
    const cached = cache.get<ClubPlayerEntry[]>(cacheKey);
    if (cached) return cached;

    const sparql = `
SELECT DISTINCT ?player ?playerLabel ?startDate ?endDate ?positionLabel ?nationality ?nationalityLabel ?birthDate WHERE {
  ?player wdt:P31 wd:Q5;
          p:P54 ?membership.
  ?membership ps:P54 wd:${clubId}.
  OPTIONAL { ?membership pq:P580 ?startDate. }
  OPTIONAL { ?membership pq:P582 ?endDate. }
  OPTIONAL { ?player wdt:P413 ?position. }
  OPTIONAL { ?player wdt:P27 ?nationality. }
  OPTIONAL { ?player wdt:P569 ?birthDate. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
}
ORDER BY ?playerLabel
LIMIT 2000`;

    try {
      const bindings = await sparqlQuery<Binding>(sparql);
      const entries = this.parsePlayerBindings(bindings, clubId);
      cache.set(cacheKey, entries);
      return entries;
    } catch {
      return [];
    }
  }

  private parsePlayerBindings(bindings: Binding[], clubId: string): ClubPlayerEntry[] {
    const playerMap = new Map<string, { player: Player; entries: CareerEntry[] }>();

    for (const b of bindings) {
      const playerUri = sparqlValue(b, "player");
      const playerId = wikidataId(playerUri) ?? playerUri ?? "";
      const playerName = sparqlValue(b, "playerLabel") ?? "";
      if (!playerId || !playerName) continue;

      const startDateRaw = sparqlValue(b, "startDate");
      const endDateRaw = sparqlValue(b, "endDate");

      const entry: CareerEntry = {
        clubId,
        clubName: clubId,
        startDate: startDateRaw ? this.formatDate(startDateRaw) : undefined,
        endDate: endDateRaw ? this.formatDate(endDateRaw) : undefined,
        startYear: extractYear(startDateRaw),
        endYear: extractYear(endDateRaw),
        position: sparqlValue(b, "positionLabel"),
      };

      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, {
          player: {
            id: playerId,
            name: playerName,
            nationality: sparqlValue(b, "nationalityLabel"),
            birthDate: sparqlValue(b, "birthDate") ? this.formatDate(sparqlValue(b, "birthDate")!) : undefined,
            birthYear: extractYear(sparqlValue(b, "birthDate")),
            position: sparqlValue(b, "positionLabel"),
            wikidataId: playerId,
            careerEntries: [],
          },
          entries: [],
        });
      }

      playerMap.get(playerId)!.entries.push(entry);
    }

    const result: ClubPlayerEntry[] = [];

    for (const { player, entries } of playerMap.values()) {
      const deduped = this.deduplicateEntries(entries);
      player.careerEntries = deduped;

      for (const entry of deduped) {
        result.push({ player, clubEntry: entry });
      }
    }

    return result;
  }

  private deduplicateEntries(entries: CareerEntry[]): CareerEntry[] {
    const seen = new Set<string>();
    return entries.filter((e) => {
      const key = `${e.startYear ?? ""}-${e.endYear ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private formatDate(raw: string): string {
    const match = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return raw;
    const [, y, m, d] = match;
    if (m === "01" && d === "01") return y;
    return `${d}.${m}.${y}`;
  }
}

export const wikidataProvider = new WikidataProvider();
