const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";

export async function sparqlQuery<T = unknown>(query: string): Promise<T[]> {
  const url = new URL(WIKIDATA_ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "FootballHistoryApp/1.0 (educational project)",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`SPARQL query failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return json.results.bindings as T[];
}

export function sparqlValue(binding: Record<string, { value: string } | undefined>, key: string): string | undefined {
  return binding[key]?.value;
}

export function wikidataId(uri: string | undefined): string | undefined {
  if (!uri) return undefined;
  const match = uri.match(/Q\d+/);
  return match ? match[0] : undefined;
}

export function extractYear(dateStr: string | undefined): number | undefined {
  if (!dateStr) return undefined;
  const match = dateStr.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : undefined;
}
