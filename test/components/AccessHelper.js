import expect from 'expect';
import * as AccessHelper from '../../src/utils/AccessHelper';

describe('userHasAccess', () => {
  // levels -> 0: READ,  1: WRITE,  2: ADMIN
  it('rejects users without sufficient access', () => {
    const user = { _id: 'abc123', groups: ['abc', 'def', 'ghi'] };
    const accessObj = { users: [], groups: [] };
    expect(AccessHelper.userHasAccess(user, accessObj, 'NONE')).toEqual(false);
    expect(AccessHelper.userHasAccess(user, accessObj, 'WRITE')).toEqual(false);

    // group
    accessObj.groups.push({ id: 'abc', flags: [], level: 0 });
    expect(AccessHelper.userHasAccess(user, accessObj, 'WRITE')).toEqual(false);
    accessObj.groups.pop();

    // user
    accessObj.users.push({ id: 'abc123', flags: [], level: 1 });
    expect(AccessHelper.userHasAccess(user, accessObj, 'ADMIN')).toEqual(false);
  });

  it('accepts users with sufficient access', () => {
    const user = { _id: 'abc123', groups: ['abc', 'def', 'ghi'] };
    const accessObj = { users: [], groups: [] };

    // group
    accessObj.groups.push({ id: 'abc', flags: [], level: 0 });
    expect(AccessHelper.userHasAccess(user, accessObj, 'READ')).toEqual(true);

    accessObj.groups[0].level = 1;
    expect(AccessHelper.userHasAccess(user, accessObj, 'WRITE')).toEqual(true);
    accessObj.groups.pop();

    // users
    accessObj.users.push({ id: 'abc123', flags: [], level: 2 });
    expect(AccessHelper.userHasAccess(user, accessObj, 'ADMIN')).toEqual(true);

    // works with numbers as access
    expect(AccessHelper.userHasAccess(user, accessObj, 2)).toEqual(true);
  });
});
