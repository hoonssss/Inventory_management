export const tokenizeSearch = (query: string) => query
  .trim()
  .toLowerCase()
  .split(/\s+/)
  .filter(Boolean);

export const matchesSearchTokens = (query: string, ...fields: Array<string | undefined | null>) => {
  const tokens = tokenizeSearch(query);
  if (tokens.length === 0) return true;

  const normalizedFields = fields
    .map((field) => String(field || '').toLowerCase());

  return tokens.every((token) => normalizedFields.some((field) => field.includes(token)));
};
