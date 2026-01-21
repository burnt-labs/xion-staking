#!/usr/bin/env bash

set -e

pnpm run lint
pnpm run type-check
pnpm run test

QUICK_BUILD=true pnpm run build
