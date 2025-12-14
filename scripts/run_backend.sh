#!/bin/bash
# Run backend NestJS server locally
# Usage: ./run_backend.sh

set -e

cd "$(dirname "$0")/../backend"
npm run start:dev
