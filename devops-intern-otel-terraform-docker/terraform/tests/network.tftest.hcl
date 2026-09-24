mock_provider "aws" {
  mock_resource "aws_iam_role" {
    defaults = { arn = "arn:aws:iam::123456789012:role/mock" }
  }
  mock_resource "aws_lb" {
    defaults = { arn = "arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/mock/1234567890123456" }
  }
  mock_resource "aws_lb_target_group" {
    defaults = { arn = "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/mock/1234567890123456" }
  }
  mock_resource "aws_lb_listener" {
    defaults = { arn = "arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/mock/1234567890123456/1234567890123456" }
  }
  mock_resource "aws_ecs_task_definition" {
    defaults = { arn = "arn:aws:ecs:us-east-1:123456789012:task-definition/mock:1" }
  }
  mock_resource "aws_cloudwatch_log_group" {
    defaults = { arn = "arn:aws:logs:us-east-1:123456789012:log-group:/ecs/mock" }
  }
}
variables {
  allowed_client_cidr = "203.0.113.10/32"
  container_image     = "example.invalid/api@sha256:0000000000000000000000000000000000000000000000000000000000000000"
}
run "private_tasks_and_restricted_ingress" {
  command = apply
  assert {
    condition     = aws_vpc_security_group_ingress_rule.app_from_alb.referenced_security_group_id == aws_security_group.alb.id && aws_vpc_security_group_ingress_rule.app_from_alb.security_group_id == aws_security_group.app.id
    error_message = "App ingress must come only from the ALB security group."
  }
  assert {
    condition     = aws_vpc_security_group_ingress_rule.app_from_alb.from_port == var.app_port && aws_vpc_security_group_ingress_rule.app_from_alb.to_port == var.app_port
    error_message = "App ingress must expose only the configured app port."
  }
  assert {
    condition     = !aws_ecs_service.app.network_configuration[0].assign_public_ip && toset(aws_ecs_service.app.network_configuration[0].subnets) == toset(aws_subnet.private[*].id)
    error_message = "Tasks must have no public IP and must use private subnets."
  }
  assert {
    condition     = aws_route.private_egress.nat_gateway_id == aws_nat_gateway.main.id && aws_route.internet.gateway_id == aws_internet_gateway.main.id
    error_message = "Private egress needs NAT; public egress needs the Internet gateway."
  }
  assert {
    condition     = aws_vpc_security_group_ingress_rule.clients.cidr_ipv4 == var.allowed_client_cidr && aws_lb_listener.http.default_action[0].type == "fixed-response"
    error_message = "Only allowlisted clients may reach the ALB, which must deny routes by default."
  }
}
run "reject_open_internet" {
  command = plan
  variables { allowed_client_cidr = "0.0.0.0/0" }
  expect_failures = [var.allowed_client_cidr]
}
run "reject_mutable_image" {
  command = plan
  variables { container_image = "example.invalid/api:latest" }
  expect_failures = [var.container_image]
}
