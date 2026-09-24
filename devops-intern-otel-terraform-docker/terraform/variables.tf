variable "name" {
  type    = string
  default = "devops-intern"
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,19}$", var.name))
    error_message = "Use 3–20 lowercase letters, digits or hyphens, starting with a letter."
  }
}
variable "region" {
  type    = string
  default = "us-east-1"
}
variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b"]
  validation {
    condition     = length(var.availability_zones) == 2 && length(distinct(var.availability_zones)) == 2
    error_message = "Supply two distinct availability zones in the selected region."
  }
}
variable "allowed_client_cidr" {
  type        = string
  description = "IPv4 CIDR permitted to reach the load balancer; use your public IP/32."
  validation {
    condition     = can(cidrnetmask(var.allowed_client_cidr)) && var.allowed_client_cidr != "0.0.0.0/0"
    error_message = "Supply an explicit IPv4 allowlist, not the entire Internet."
  }
}
variable "app_port" {
  type    = number
  default = 3000
  validation {
    condition     = var.app_port >= 1024 && var.app_port <= 65535 && floor(var.app_port) == var.app_port && var.app_port != 4318
    error_message = "Use an integer port between 1024 and 65535, excluding the collector's port 4318."
  }
}
variable "container_image" {
  type        = string
  description = "Publicly pullable linux/amd64 app image pinned by SHA256 digest."
  validation {
    condition     = can(regex("^.+@sha256:[a-f0-9]{64}$", var.container_image))
    error_message = "Use an immutable image reference ending in @sha256:<64 hex characters>."
  }
}
variable "sentry_secret_arn" {
  type        = string
  default     = ""
  description = "Optional Secrets Manager secret ARN whose entire value is the Sentry DSN. Never put the DSN in tfvars."
}
variable "offline_plan" {
  type        = bool
  default     = false
  description = "Only for credential-free speculative CI plans; real deployments must leave this false."
}
