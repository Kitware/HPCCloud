import expect from 'expect';
import get from '../../src/utils/get';

describe('get', () => {
  const obj = {
    prop1: {
      subpropA: {
        subsubPropA: 'my prop A',
        subsubPropB: 'B',
      },
      arrayProp: [0, 1, 2, 3, 4],
    }
  };

  it('fetches elements given path', () => {
    expect(get(obj, 'prop1.subpropA.subsubPropB'))
      .toEqual('B');
  });

  it('fetches length of array and string', () => {
    expect(get(obj, 'prop1.arrayProp.length'))
      .toEqual(5);

    expect(get(obj, 'prop1.subpropA.subsubPropA.length'))
      .toEqual(9);
  });

  it('returns false if object doesn\'t exist', () => {
    expect(get(obj.fakeprop, 'someprop'))
      .toBe(false);

    expect(get(obj, 'fakeprop.someprop'))
      .toBe(false);
  });

  it('returns false when property not found', () => {
    expect(get(obj, 'fakeprop'))
      .toBe(false);

    expect(get(obj, 'fakeprop.wow'))
      .toBe(false);
  });

  it('returns false when final property not found', () => {
    expect(get(obj, 'prop1.subpropC'))
      .toBe(false);

    expect(get(obj, 'prop1.subpropA.wow'))
      .toBe(false);
  });

  it('returns 0 when the last property in a keypath is length', () => {
    expect(get(obj, 'prop1.fakeprop.length'))
      .toEqual(0);
  });
});
