import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const original = JSON.parse(fs.readFileSync('terraform/plan.json', 'utf8').replace(/^\uFEFF/, ''));
const mutations = {
  'public task IP': plan => { plan.planned_values.root_module.resources.find(r => r.type === 'aws_ecs_service').values.network_configuration[0].assign_public_ip = true; },
  'direct app CIDR ingress': plan => { plan.planned_values.root_module.resources.find(r => r.address.endsWith('.app_from_alb')).values.cidr_ipv4 = '0.0.0.0/0'; },
  'extra ingress rule': plan => { plan.planned_values.root_module.resources.push({ type: 'aws_vpc_security_group_ingress_rule', address: 'unsafe.extra', values: {} }); },
  'legacy ingress rule': plan => { plan.planned_values.root_module.resources.push({ type: 'aws_security_group_rule', address: 'unsafe.legacy', values: {} }); },
  'public metrics forwarding': plan => { plan.planned_values.root_module.resources.find(r => r.type === 'aws_lb_listener_rule').values.condition[0].path_pattern[0].values.push('/metrics'); }
};
for (const [name, mutate] of Object.entries(mutations)) test(`rejects ${name}`, () => {
  const changed = structuredClone(original);
  mutate(changed);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'network-plan-'));
  try {
    const filename = path.join(dir, 'plan.json');
    fs.writeFileSync(filename, JSON.stringify(changed));
    const result = spawnSync(process.execPath, ['scripts/check-plan.mjs', filename], { encoding: 'utf8' });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 1, `Unsafe plan unexpectedly accepted: ${name}`);
    assert.match(result.stderr, /AssertionError/);
  } finally {
    fs.unlinkSync(path.join(dir, 'plan.json'));
    fs.rmdirSync(dir);
  }
});
test('accepts refreshed SG values containing the separately managed ingress', () => {
  const refreshed = structuredClone(original);
  refreshed.planned_values.root_module.resources.find(r => r.address === 'aws_security_group.app').values.ingress = [{ from_port: 3000, to_port: 3000 }];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'network-plan-'));
  const filename = path.join(dir, 'plan.json');
  try {
    fs.writeFileSync(filename, JSON.stringify(refreshed));
    const result = spawnSync(process.execPath, ['scripts/check-plan.mjs', filename], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  } finally {
    fs.unlinkSync(filename);
    fs.rmdirSync(dir);
  }
});
