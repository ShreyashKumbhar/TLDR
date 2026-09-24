import fs from 'node:fs';
import assert from 'node:assert/strict';
const plan = JSON.parse(fs.readFileSync(process.argv[2] ?? 'terraform/plan.json', 'utf8').replace(/^\uFEFF/, ''));
const resources = plan.planned_values.root_module.resources;
const get = address => {
  const resource = resources.find(r => r.address === address);
  assert.ok(resource, `Missing ${address}`);
  return resource.values;
};
const config = address => plan.configuration.root_module.resources.find(r => r.address === address);
const refs = (address, expression) => config(address).expressions[expression].references;
const app = get('aws_vpc_security_group_ingress_rule.app_from_alb');
assert.equal(app.from_port, plan.variables.app_port.value);
assert.equal(app.to_port, app.from_port);
assert.equal(app.ip_protocol, 'tcp');
assert.ok(!app.cidr_ipv4 && !app.cidr_ipv6);
assert.ok(refs('aws_vpc_security_group_ingress_rule.app_from_alb', 'referenced_security_group_id').includes('aws_security_group.alb.id'));
assert.equal(resources.filter(r => r.type === 'aws_vpc_security_group_ingress_rule').length, 2);
assert.equal(resources.filter(r => r.type === 'aws_security_group_rule').length, 0);
assert.equal(resources.filter(r => r.type === 'aws_security_group').length, 2);
// Refreshed SG values contain separately managed rules too. Reject inline rules
// in configuration, not those computed values, so later deployment plans work.
for (const group of resources.filter(r => r.type === 'aws_security_group')) assert.ok(!config(group.address).expressions.ingress);
const clients = get('aws_vpc_security_group_ingress_rule.clients');
assert.equal(clients.cidr_ipv4, plan.variables.allowed_client_cidr.value);
assert.notEqual(clients.cidr_ipv4, '0.0.0.0/0');
assert.equal(clients.from_port, 80);
assert.equal(clients.to_port, 80);
assert.equal(get('aws_ecs_service.app').network_configuration[0].assign_public_ip, false);
assert.equal(get('aws_lb_listener.http').default_action[0].type, 'fixed-response');
assert.deepEqual(get('aws_lb_listener_rule.health').condition[0].path_pattern[0].values, ['/health']);
assert.equal(get('aws_lb_target_group.app').health_check[0].path, '/health');
for (let i = 0; i < 2; i++) assert.equal(get(`aws_subnet.private[${i}]`).map_public_ip_on_launch, false);
assert.ok(refs('aws_route.private_egress', 'nat_gateway_id').includes('aws_nat_gateway.main.id'));
console.log(`Network policy assertions passed (${resources.length} planned resources).`);
