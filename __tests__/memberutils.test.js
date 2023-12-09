import { expect, test } from 'vitest'
import { membershipType } from '../src/lib/utils';

test('type', async () => {
  expect(membershipType({ type: 'Honorary' })).toBe('You are an Elder Gaffer or other honorary member');
  expect(membershipType({ type: 'Single', payment: 'Direct Debit' })).toBe('Your membership type is Single and you pay by Direct Debit.');
  expect(membershipType({ type: 'Junior', yob: 1963, payment: 'Direct Debit' })).toBe('Your membership type is Junior and you pay by Direct Debit but we have your year of birth recorded as 1963 so you should change to Single or Family membership.');
  expect(membershipType({ type: 'Junior', yob: 2010, payment: 'Direct Debit' })).toBe('Your membership type is Junior and you pay by Direct Debit.');
});
