/** Utilities to get the key in KVdb for a value. */
export const keys = {
  layers: "layers",
  ep: "ep",
  points: "points",
  metadata: (idx: number) => `m:${idx}` as const,
  /** Maps a point index to its key in the KVdb. */
  point: (idx: number) => `${idx}` as const,
  /** Maps a neighbor (layer & index) to its key in the KVdb. */
  neighbor: (layer: number, idx: number) => `${layer}__${idx}` as const,
} as const;

/** Safely parses a data, returning `null` if its falsy. */
export function safeParse<V = unknown>(data: string | null | undefined): V | null {
  return data ? JSON.parse(data) : null;
}
