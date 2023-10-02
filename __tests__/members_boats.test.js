
test('mb', async () => {
  const membersBoats = (await import('../src/lib/members_boats')).default;
  expect(membersBoats).toBeDefined();
});
