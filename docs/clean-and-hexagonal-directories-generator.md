# NestJS Clean + Hexagonal Architecture Directories Generator

This tool automates the creation of new modules using our detailed Clean / Hexagonal Architecture folder structure. It is built as a Bash script that can be executed via your package manager.

## Setup

**1. Create the Script**
Create a file named `generate-module.sh` in the root of your project and paste the following code. This script adheres to the project's formatting rules (tabs, double quotes, and semicolons) for generated TypeScript files:

```bash
#!/bin/bash

read -p "Enter module name: " MODULE_NAME

# Convert the input to lowercase for the folder name
MODULE_NAME=$(echo "$MODULE_NAME" | tr '[:upper:]' '[:lower:]')

# Capitalize the first letter for the NestJS Class Name
CLASS_NAME="$(tr '[:lower:]' '[:upper:]' <<< ${MODULE_NAME:0:1})${MODULE_NAME:1}Module"

TARGET_DIR="src/$MODULE_NAME"

# Create the Hexagonal directories
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
```

**2. Make the Script Executable (Linux/macOS)**
If you are on a Unix-based system, grant execution permissions to the script:
```bash
chmod +x generate-module.sh
```

**3. Register the Command**
Add the execution command to the `"scripts"` block in your `package.json`. Prepending it with `bash` ensures it runs correctly across different environments, including Git Bash on Windows:

```json
"scripts": {
	"generate:module": "bash generate-module.sh"
}
```

---

## Usage

To generate a new module, run the following command from your terminal:

```bash
npm run generate:module
```

*(Note: You can substitute `npm` with `yarn` or `pnpm` if you are using a different package manager).*

The script will prompt you for the module name:
```text
Enter module name: recruitment
```

## Expected Output

Upon entering the module name, the script will instantly scaffold the new module inside your `src` directory with the following detailed structure:

```text
Output:
recruitment
- application
    - exceptions
    - ports
        - inbound
        - outbound
    - use-cases
- domain
    - entities
    - events
    - exceptions
    - repositories
    - value-objects
- infrastructure
    - adapters
- presentation
    - controllers
    - dtos
    - event-listeners
- recruitment.module.ts
```
