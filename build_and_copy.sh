#!/bin/bash

# Define the paths
ANGULAR_DIST_DIR="./dist/field-contact/browser"
SPRING_BOOT_STATIC_DIR="../field_contact_bff/src/main/resources/static/app"

# 1. Clean up old build
echo "Cleaning old Angular build directory..."
rm -rf "$SPRING_BOOT_STATIC_DIR"

# 2. Build the Angular application
echo "Building the Angular application..."
#   ng cache clean
ng build --base-href="/field_contact_bff/app/" --configuration=production

##npm run build

# 3. Delete the target directory
echo "Deleting target directory..."
rm -rf "$SPRING_BOOT_STATIC_DIR"

# 3. Create the target directory if it doesn't exist
echo "Creating target directory..."
mkdir -p "$SPRING_BOOT_STATIC_DIR"

# 4. Copy the build output to the Spring Boot project
echo "Copying Angular build artifacts to Spring Boot..."
cp -r "$ANGULAR_DIST_DIR"/* "$SPRING_BOOT_STATIC_DIR"

echo "Angular build successfully copied to Spring Boot."
