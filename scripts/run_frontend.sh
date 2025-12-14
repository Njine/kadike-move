#!/bin/bash
# Run frontend Vite dev server
# Usage: ./run_frontend.sh

set -e

cd "$(dirname "$0")/../frontend"
npm run dev
