#!/bin/bash

read -p "Enter module name: " MODULE_NAME

# Convert the input to lowercase for the folder name
MODULE_NAME=$(echo "$MODULE_NAME" | tr '[:upper:]' '[:lower:]')

# Capitalize the first letter for the NestJS Class Name
CLASS_NAME="$(tr '[:lower:]' '[:upper:]' <<< ${MODULE_NAME:0:1})${MODULE_NAME:1}Module"

TARGET_DIR="src/$MODULE_NAME"

# Create the Clean Architecture + Hexagonal directories
mkdir -p "$TARGET_DIR/application/exceptions"
mkdir -p "$TARGET_DIR/application/ports/inbound"
mkdir -p "$TARGET_DIR/application/ports/outbound"
mkdir -p "$TARGET_DIR/application/use-cases"

mkdir -p "$TARGET_DIR/domain/entities"
mkdir -p "$TARGET_DIR/domain/events"
mkdir -p "$TARGET_DIR/domain/exceptions"
mkdir -p "$TARGET_DIR/domain/repositories"
mkdir -p "$TARGET_DIR/domain/value-objects"

mkdir -p "$TARGET_DIR/infrastructure/adapters"

mkdir -p "$TARGET_DIR/presentation/controllers"
mkdir -p "$TARGET_DIR/presentation/dtos"
mkdir -p "$TARGET_DIR/presentation/event-listeners"

# Generate the module file
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
echo "Output:"
echo "$MODULE_NAME"
echo "- application"
echo "    - exceptions"
echo "    - ports"
echo "        - inbound"
echo "        - outbound"
echo "    - use-cases"
echo "- domain"
echo "    - entities"
echo "    - events"
echo "    - exceptions"
echo "    - repositories"
echo "    - value-objects"
echo "- infrastructure"
echo "    - adapters"
echo "- presentation"
echo "    - controllers"
echo "    - dtos"
echo "    - event-listeners"
echo "- $MODULE_NAME.module.ts"
