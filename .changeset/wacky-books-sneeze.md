---
"xion-staking": patch
---

Update @burnt-labs/abstraxion to 1.0.0-alpha.73 and fix breaking API changes

- Add chainId to AbstraxionProvider config (now required)
- Fix CSS import path for new package structure
- Use login/logout from useAbstraxionAccount (useModal hook removed)
- Remove Abstraxion component usage (now handled internally)
- Remove deprecated xiontestnet chain, use xiontestnet2 only
- Add throwErrors prop to ChainProvider (now required)
- Fix type compatibility issues with cosmjs and React
