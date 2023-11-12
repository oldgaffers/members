test('type', async () => {
  const utils = (await import('../src/lib/utils'));
  expect(utils.membershipType({ type: 'Honorary' })).toBe('You are an Elder Gaffer or other honorary member');
  expect(utils.membershipType({ type: 'Single', payment: 'Direct Debit' })).toBe('Your membership type is Single and you pay by Direct Debit.');
  expect(utils.membershipType({ type: 'Junior', yob: 1963, payment: 'Direct Debit' })).toBe('Your membership type is Junior and you pay by Direct Debit but we have your year of birth recorded as 1963 so you should change to Single or Family membership.');
  expect(utils.membershipType({ type: 'Junior', yob: 2010, payment: 'Direct Debit' })).toBe('Your membership type is Junior and you pay by Direct Debit.');
});
