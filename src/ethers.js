// Local shim to work around CRA/webpack 5 resolution issues with ethers v6.
// Imports directly from the CommonJS build to avoid "exports" field mismatches.
export * from "../node_modules/ethers/lib.commonjs/index.js";
export { ethers } from "../node_modules/ethers/lib.commonjs/index.js";
