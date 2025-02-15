const accountServerToRegion: Record<string, string> = {
  na: "americas",
  br: "americas",
  lan: "americas",
  las: "americas",

  kr: "asia",
  jp: "asia",

  eune: "europe",
  euw: "europe",
  me1: "europe",
  tr: "europe",
  ru: "europe",

  oce: "sea",
  sg2: "sea",
  tw2: "sea",
  vn2: "sea",
};

export function getApiRegion(accountServer: string): string | undefined {
  return accountServerToRegion[accountServer];
}
