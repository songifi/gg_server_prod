export const generateCacheKey = (
  contentType: string,
  id: string,
  region: string,
): string => {
  return `${contentType}:${id}:${region}`;
};
