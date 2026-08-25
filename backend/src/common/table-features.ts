import { TableFeature } from '@prisma/client';

export const TABLE_FEATURES: TableFeature[] = [
  'WINDOW_VIEW',
  'PROJECTOR_VIEW',
  'TERRACE',
  'PRIVATE_DINING',
  'FAMILY_FRIENDLY',
  'QUIET_ZONE',
  'LIVE_MUSIC_VIEW',
  'BAR_COUNTER',
];

export function scoreFeatureMatch(preferred: TableFeature[], available: TableFeature[]) {
  return preferred.reduce((score, feature) => score + (available.includes(feature) ? 1 : 0), 0);
}
