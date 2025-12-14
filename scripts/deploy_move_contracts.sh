#!/bin/bash
# Deploy Move 2 contracts
# Usage: ./deploy_move_contracts.sh <account_address>

set -e

MOVE_CONTRACTS_DIR="$(dirname "$0")/../contracts"
ACCOUNT_ADDRESS="$1"

if [ -z "$ACCOUNT_ADDRESS" ]; then
  echo "Usage: $0 <account_address>"
  exit 1
fi

# Example Move CLI command (replace with your Move CLI toolchain)
move publish --package-dir "$MOVE_CONTRACTS_DIR" --sender "$ACCOUNT_ADDRESS"
