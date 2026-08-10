#!/bin/bash

read -p "Enter module name: " MODULE_NAME

# Convert the input to lowercase for the folder name
MODULE_NAME=$(echo "$MODULE_NAME" | tr '[:upper:]' '[:lower:]')

# Capitalize the first letter for the NestJS Class Name
CLASS_NAME="$(tr '[:lower:]' '[:upper:]' <<< ${MODULE_NAME:0:1})${MODULE_NAME:1}Module"

TARGET_DIR="src/$MODULE_NAME"

# Function to create dir and .gitkeep with instructions
create_dir_with_keep() {
	mkdir -p "$1"
	echo "$2" > "$1/.gitkeep"
}

# 1. Application Layer
create_dir_with_keep "$TARGET_DIR/application/exceptions" "# Application Exceptions: Specific errors related to application flows and use cases."
create_dir_with_keep "$TARGET_DIR/application/ports/inbound" "# Inbound Ports: Interfaces/Contracts for communication entering the application layer (e.g., Use Case interfaces)."
create_dir_with_keep "$TARGET_DIR/application/ports/outbound" "# Outbound Ports: Interfaces/Contracts for communication leaving the application layer (e.g., Repository interfaces, External Services)."
create_dir_with_keep "$TARGET_DIR/application/use-cases" "# Use Cases: Implementations of inbound ports containing application-specific business rules and orchestration."

# 2. Domain Layer
create_dir_with_keep "$TARGET_DIR/domain/entities" "# Entities: Core business models responsible for domain logic and raising domain events."
create_dir_with_keep "$TARGET_DIR/domain/events" "# Domain Events: Events raised by entities representing business changes."
create_dir_with_keep "$TARGET_DIR/domain/exceptions" "# Domain Exceptions: Business rule violations and validation exceptions."
create_dir_with_keep "$TARGET_DIR/domain/repositories" "# Repositories: Interfaces defining data access contracts for aggregates."
create_dir_with_keep "$TARGET_DIR/domain/types" "# Types: Domain-specific types and enums."
create_dir_with_keep "$TARGET_DIR/domain/value-objects" "# Value Objects: Immutable objects representing descriptive aspects of the domain with no conceptual identity."

# 3. Infrastructure Layer
create_dir_with_keep "$TARGET_DIR/infrastructure/adapters/persistence" "# Persistence Adapters: Database-specific repository implementations (e.g., Prisma repositories)."
create_dir_with_keep "$TARGET_DIR/infrastructure/events/listeners" "# Event Listeners: Handlers that react to domain or integration events."
create_dir_with_keep "$TARGET_DIR/infrastructure/mappers" "# Mappers: Translates persistence or external records directly to Domain entities."
create_dir_with_keep "$TARGET_DIR/infrastructure/notifications" "# Notifications: Implementations for sending emails, SMS, or other external communications."
create_dir_with_keep "$TARGET_DIR/infrastructure/queues" "# Queues: Processors and configurations for background jobs (e.g., BullMQ)."
create_dir_with_keep "$TARGET_DIR/infrastructure/tasks" "# Tasks: Cron jobs and scheduled tasks using NestJS Schedule."

# 4. Presentation Layer
create_dir_with_keep "$TARGET_DIR/presentation/controllers" "# Controllers: HTTP endpoints handling incoming requests."
create_dir_with_keep "$TARGET_DIR/presentation/dtos" "# DTOs: Data Transfer Objects for request validation and response formatting."
create_dir_with_keep "$TARGET_DIR/presentation/filters" "# Filters: Maps Domain and Application Exceptions to proper HTTP Status codes."
create_dir_with_keep "$TARGET_DIR/presentation/guards" "# Guards: Route protection and authorization checks."
create_dir_with_keep "$TARGET_DIR/presentation/mappers" "# Mappers: Translates use-case results into response DTOs."
create_dir_with_keep "$TARGET_DIR/presentation/pipes" "# Pipes: Data transformation and validation payloads for controllers."

# Generate the module file (ensuring tabs, double quotes, and semicolons)
cat <<EOF> "$TARGET_DIR/$MODULE_NAME.module.ts"
import { Module } from "@nestjs/common";

@Module({
	imports: [],
	controllers: [],
	providers: [],
})
export class $CLASS_NAME {}
EOF

# Print the requested output
echo "Module generated successfully at: $TARGET_DIR/"
echo "All directories have been seeded with documented .gitkeep files."
