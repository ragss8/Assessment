import assert from 'node:assert/strict';
import test from 'node:test';
import { scoreFeatureMatch } from './table-features';

test('scores only matching table preferences', () => {
  assert.equal(
    scoreFeatureMatch(
      ['WINDOW_VIEW', 'QUIET_ZONE', 'TERRACE'],
      ['WINDOW_VIEW', 'FAMILY_FRIENDLY', 'TERRACE'],
    ),
    2,
  );
});

test('returns zero when there are no preferred features', () => {
  assert.equal(scoreFeatureMatch([], ['WINDOW_VIEW']), 0);
});
