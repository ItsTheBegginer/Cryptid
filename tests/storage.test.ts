import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { deserialize, serialize } from '../src/engine';
import { stateArb } from './helpers';

describe('storage', () => {
  it('save then load returns identical state', () => {
    fc.assert(fc.property(stateArb, (state) => {
      expect(deserialize(serialize(state))).toEqual(state);
    }));
  });

  it('corrupt or wrong-version data loads as null instead of throwing', () => {
    fc.assert(fc.property(fc.string(), (junk) => {
      expect(() => deserialize(junk)).not.toThrow();
    }));
    expect(deserialize('{"v":999,"state":{}}')).toBeNull();
  });
});
