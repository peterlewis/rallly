#!/bin/sh
set -e
export NEXT_PUBLIC_APP_VERSION=$(git describe)
echo "Building version v$NEXT_PUBLIC_APP_VERSION"
yarn build
# Deploy migration using direct database connection (no connection pool)
DATABASE_URL=$DIRECT_DATABASE_URL yarn db:deploy