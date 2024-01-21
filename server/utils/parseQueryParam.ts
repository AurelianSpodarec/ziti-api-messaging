// server/utils/parseQueryParam.ts

export function parseQueryParam (param: string | undefined, defaultValue: number): number {
  // Use nullish coalescing to handle null/undefined explicitly
  const result = parseInt(param ?? '', 10)
  return isNaN(result) ? defaultValue : result
}
