import { test } from 'node:test';
import assert from 'node:assert/strict';

// Role IDs are read when the module is first evaluated, so set them before the first import.
async function loadRoleMapper() {
  process.env.DISCORD_ROLE_CHEF_ID = '111';
  process.env.DISCORD_ROLE_SIRKEL_ID = '222';
  return (await import('../src/lib/discord')).roleFromDiscordRoleIds;
}

test('CHEF wins when a member holds both role IDs', async () => {
  const roleFromDiscordRoleIds = await loadRoleMapper();
  assert.equal(roleFromDiscordRoleIds(['222', '111']), 'CHEF');
});

test('SIRKEL when only the core role ID is present', async () => {
  const roleFromDiscordRoleIds = await loadRoleMapper();
  assert.equal(roleFromDiscordRoleIds(['999', '222']), 'SIRKEL');
});

test('MALAZZ for unrelated or empty role lists', async () => {
  const roleFromDiscordRoleIds = await loadRoleMapper();
  assert.equal(roleFromDiscordRoleIds([]), 'MALAZZ');
  assert.equal(roleFromDiscordRoleIds(['999', '888']), 'MALAZZ');
});
