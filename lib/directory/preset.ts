/**
 * Route presets for the directory: /software/free, /software/new and friends
 * are the same listing with some query values fixed by the route. Locked
 * values always apply, are never written to the URL and cannot be removed.
 */
import { DEFAULT_QUERY, serializeQuery, type DirectoryQuery } from "./query";

export type LockedQuery = Partial<Pick<DirectoryQuery, "sort" | "freePlan" | "freeTrial">>;

export interface DirectoryPreset {
  /** Path of the listing, e.g. "/software/free". */
  basePath: string;
  locked?: LockedQuery;
}

/**
 * The query the listing actually runs: URL values with the locked ones on
 * top. While no product has a rating, a rating filter or sort from the URL
 * is ignored (the controls are not offered).
 */
export function effectiveQuery(
  parsed: DirectoryQuery,
  locked: LockedQuery | undefined,
  { ratingsAvailable }: { ratingsAvailable: boolean },
): DirectoryQuery {
  const query: DirectoryQuery = { ...parsed, ...locked };
  if (!ratingsAvailable) {
    delete query.minRating;
    if (query.sort === "rating") query.sort = DEFAULT_QUERY.sort;
  }
  return query;
}

/** The query as it belongs in the URL: locked keys reset so they are omitted. */
export function urlQuery(query: DirectoryQuery, locked: LockedQuery | undefined): DirectoryQuery {
  const out: DirectoryQuery = { ...query };
  if (locked?.sort !== undefined) out.sort = DEFAULT_QUERY.sort;
  if (locked?.freePlan !== undefined) delete out.freePlan;
  if (locked?.freeTrial !== undefined) delete out.freeTrial;
  return out;
}

/** Listing URL for a query on a preset route. */
export function directoryHref(preset: DirectoryPreset, query: DirectoryQuery): string {
  const qs = serializeQuery(urlQuery(query, preset.locked));
  return qs ? `${preset.basePath}?${qs}` : preset.basePath;
}
