# xion-staking

## 0.2.0

### Minor Changes

- 8696a64: Update inflation endpoint

### Patch Changes

- 1e6e65f: Enhance unbonding time formatting with hours and minutes.
- 69bbb9b: Convert to worker
- 18f8dbe: wrangler/package.json updates to support deployments, Modify code for multiple testnet support
- 7193bf0: Added commit signing
- 817aae7: Fix APR display to show error indication instead of fallback values when API calls fail
- 162d84b: Added support for testnet-2
- b62e063: Update @burnt-labs/abstraxion to 1.0.0-alpha.73 and fix breaking API changes
  - Add chainId to AbstraxionProvider config (now required)
  - Fix CSS import path for new package structure
  - Use login/logout from useAbstraxionAccount (useModal hook removed)
  - Remove Abstraxion component usage (now handled internally)
  - Remove deprecated xiontestnet chain, use xiontestnet2 only
  - Add throwErrors prop to ChainProvider (now required)
  - Fix type compatibility issues with cosmjs and React

- 07b112b: Update burnt-labs packages to latest versions
  - @burnt-labs/abstraxion: 1.0.0-alpha.57 → 1.0.0-alpha.66
  - @burnt-labs/constants: 0.1.0-alpha.15 → 0.1.0-alpha.18
  - @burnt-labs/ui: 0.1.0-alpha.7 → 0.1.0-alpha.17
