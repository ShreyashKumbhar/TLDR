resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.name}"
  retention_in_days = 7
}
resource "aws_iam_role" "execution" {
  name_prefix = "${var.name}-execution-"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{
    Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" }, Action = "sts:AssumeRole"
  }] })
}
resource "aws_iam_role_policy" "execution" {
  role = aws_iam_role.execution.id
  policy = jsonencode({ Version = "2012-10-17", Statement = concat([
    { Effect = "Allow", Action = ["logs:CreateLogStream", "logs:PutLogEvents"], Resource = "${aws_cloudwatch_log_group.app.arn}:*" }
    ], var.sentry_secret_arn == "" ? [] : [
    { Effect = "Allow", Action = ["secretsmanager:GetSecretValue"], Resource = var.sentry_secret_arn }
  ]) })
}
resource "aws_iam_role" "task" {
  name_prefix        = "${var.name}-task-"
  assume_role_policy = aws_iam_role.execution.assume_role_policy
  # The app and collector need no AWS API permissions.
}
resource "aws_ecs_cluster" "main" {
  name = var.name
}
locals {
  collector_config = yamlencode({
    receivers = {
      otlp = { protocols = { http = { endpoint = "127.0.0.1:4318" } } }
      prometheus = { config = { scrape_configs = [{
        job_name = "api", scrape_interval = "15s", static_configs = [{ targets = ["127.0.0.1:${var.app_port}"] }]
      }] } }
    }
    processors = { batch = { timeout = "5s" } }
    exporters  = { debug = { verbosity = "detailed" } }
    service = { pipelines = {
      traces  = { receivers = ["otlp"], processors = ["batch"], exporters = ["debug"] }
      logs    = { receivers = ["otlp"], processors = ["batch"], exporters = ["debug"] }
      metrics = { receivers = ["otlp", "prometheus"], processors = ["batch"], exporters = ["debug"] }
    } }
  })
  log_options = { "awslogs-group" = aws_cloudwatch_log_group.app.name, "awslogs-region" = var.region, "awslogs-stream-prefix" = "ecs" }
}
resource "aws_ecs_task_definition" "app" {
  family                   = var.name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
  container_definitions = jsonencode([
    {
      name                   = "api", image = var.container_image, essential = true, user = "1000",
      readonlyRootFilesystem = true,
      portMappings           = [{ containerPort = var.app_port, protocol = "tcp" }],
      environment = [
        { name = "PORT", value = tostring(var.app_port) },
        { name = "OTEL_EXPORTER_OTLP_ENDPOINT", value = "http://127.0.0.1:4318" },
        { name = "OTEL_EXPORTER_OTLP_PROTOCOL", value = "http/json" }
      ],
      secrets   = var.sentry_secret_arn == "" ? [] : [{ name = "SENTRY_DSN", valueFrom = var.sentry_secret_arn }],
      dependsOn = [{ containerName = "collector", condition = "START" }],
      healthCheck = {
        command  = ["CMD-SHELL", "node -e \"fetch('http://127.0.0.1:${var.app_port}/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\""],
        interval = 30, timeout = 5, retries = 3, startPeriod = 20
      },
      logConfiguration = { logDriver = "awslogs", options = local.log_options }
    },
    {
      name                   = "collector", image = "otel/opentelemetry-collector-contrib:0.120.0", essential = true,
      readonlyRootFilesystem = true,
      command                = ["--config=env:OTEL_CONFIG"],
      environment            = [{ name = "OTEL_CONFIG", value = local.collector_config }],
      logConfiguration       = { logDriver = "awslogs", options = local.log_options }
    }
  ])
}
resource "aws_lb" "app" {
  name               = var.name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
}
resource "aws_lb_target_group" "app" {
  name        = var.name
  port        = var.app_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id
  health_check {
    path    = "/health"
    matcher = "200"
  }
}
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "application/json"
      message_body = "{\"error\":\"not found\"}"
      status_code  = "404"
    }
  }
}
resource "aws_lb_listener_rule" "health" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
  condition {
    path_pattern { values = ["/health"] }
  }
}
resource "aws_ecs_service" "app" {
  name                              = var.name
  cluster                           = aws_ecs_cluster.main.id
  task_definition                   = aws_ecs_task_definition.app.arn
  desired_count                     = 1
  launch_type                       = "FARGATE"
  wait_for_steady_state             = true
  health_check_grace_period_seconds = 60
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = false
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "api"
    container_port   = var.app_port
  }
  depends_on = [aws_lb_listener_rule.health, aws_route.private_egress, aws_route_table_association.private, aws_iam_role_policy.execution]
}
