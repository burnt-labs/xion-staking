import BigNumber from "bignumber.js";
import { describe, expect, it } from "vitest";

import {
  formatAPR,
  formatCoin,
  formatCommission,
  formatToSmallDisplay,
  formatUnbondingCompletionTime,
  formatVotingPowerPerc,
  formatXionToUSD,
} from "./formatters";

describe("formatters", () => {
  describe("formatCoin", () => {
    it("should format a basic XION coin with decimal places", () => {
      const result = formatCoin({ amount: "100", denom: "XION" });
      expect(result).toBe("100.000000 XION");
    });

    it("should format zero amount", () => {
      const result = formatCoin({ amount: "0", denom: "XION" });
      expect(result).toBe("0 XION");
    });

    it("should format with compact notation", () => {
      const result = formatCoin({ amount: "1234567", denom: "XION" }, true);
      expect(result).toBe("1.2M XION");
    });

    it("should format without denom when noDenom is true", () => {
      const result = formatCoin({ amount: "100", denom: "XION" }, false, true);
      expect(result).toBe("100.000000");
    });

    it("should format UXION by normalising to XION", () => {
      const result = formatCoin({ amount: "1000000", denom: "UXION" });
      expect(result).toBe("1.000000 XION");
    });

    it("should format large numbers with compact notation", () => {
      const result = formatCoin(
        { amount: "1000000000", denom: "XION" },
        true,
      );
      expect(result).toBe("1B XION");
    });

    it("should format very small amounts with less than indicator", () => {
      const result = formatCoin({ amount: "0.0000001", denom: "XION" });
      expect(result).toBe("<0.000001 XION");
    });

    it("should format amounts with trailing decimals correctly", () => {
      const result = formatCoin({ amount: "123.45", denom: "XION" });
      expect(result).toBe("123.45 XION");
    });
  });

  describe("formatVotingPowerPerc", () => {
    it("should format valid percentage", () => {
      const result = formatVotingPowerPerc(0.05);
      expect(result).toBe("5.0%");
    });

    it("should format very small percentages as <0.1", () => {
      const result = formatVotingPowerPerc(0.00005);
      expect(result).toBe("<0.1%");
    });

    it("should return null for null input", () => {
      const result = formatVotingPowerPerc(null);
      expect(result).toBeNull();
    });

    it("should return null for NaN", () => {
      const result = formatVotingPowerPerc(NaN);
      expect(result).toBeNull();
    });

    it("should format 100% correctly", () => {
      const result = formatVotingPowerPerc(1);
      expect(result).toBe("100.0%");
    });
  });

  describe("formatToSmallDisplay", () => {
    it("should format with compact notation by default", () => {
      const result = formatToSmallDisplay(new BigNumber(1500000));
      expect(result).toBe("1.5M");
    });

    it("should return min number indicator when below threshold", () => {
      const result = formatToSmallDisplay(new BigNumber(0.0001), 0.001);
      expect(result).toBe("<0.001");
    });

    it("should respect maxDecimals parameter", () => {
      const result = formatToSmallDisplay(
        new BigNumber("123.456789"),
        undefined,
        2,
      );
      expect(result).toBe("123.46");
    });

    it("should format small numbers correctly", () => {
      const result = formatToSmallDisplay(new BigNumber(500));
      expect(result).toBe("500");
    });
  });

  describe("formatCommission", () => {
    it("should format commission rate correctly", () => {
      // Commission rates are stored as 18-decimal values
      const result = formatCommission("100000000000000000", 2); // 10%
      expect(result).toBe("10.00%");
    });

    it("should format zero commission", () => {
      const result = formatCommission("0", 2);
      expect(result).toBe("0.00%");
    });

    it("should format with specified decimal places", () => {
      const result = formatCommission("50000000000000000", 1); // 5%
      expect(result).toBe("5.0%");
    });

    it("should format full commission (100%)", () => {
      const result = formatCommission("1000000000000000000", 0); // 100%
      expect(result).toBe("100%");
    });
  });

  describe("formatXionToUSD", () => {
    it("should format XION to USD value", () => {
      const result = formatXionToUSD({ amount: "100", denom: "XION" }, 2);
      expect(result).toBe("$200.00");
    });

    it("should return $0 for zero amount", () => {
      const result = formatXionToUSD({ amount: "0", denom: "XION" }, 2);
      expect(result).toBe("$0");
    });

    it("should return $0 for null coin", () => {
      const result = formatXionToUSD(null, 2);
      expect(result).toBe("$0");
    });

    it("should format very small USD values", () => {
      const result = formatXionToUSD({ amount: "0.001", denom: "XION" }, 1);
      expect(result).toBe("<$0.01");
    });

    it("should format with compact notation", () => {
      const result = formatXionToUSD(
        { amount: "1000000", denom: "XION" },
        1,
        true,
      );
      expect(result).toBe("$1M");
    });
  });

  describe("formatUnbondingCompletionTime", () => {
    it("should format completed unbonding", () => {
      const pastTime = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
      const result = formatUnbondingCompletionTime(pastTime);
      expect(result).toContain("Completed on");
    });

    it("should format future unbonding with days", () => {
      const futureTime = Math.floor(Date.now() / 1000) + 86400 * 5; // 5 days from now
      const result = formatUnbondingCompletionTime(futureTime);
      expect(result).toContain("day");
      expect(result).toContain("in ");
    });

    it("should format future unbonding with hours when less than a day", () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600 * 5; // 5 hours from now
      const result = formatUnbondingCompletionTime(futureTime);
      expect(result).toContain("hour");
    });
  });

  describe("formatAPR", () => {
    it("should format APR correctly", () => {
      const result = formatAPR(new BigNumber(0.15));
      expect(result).toBe("15.00%");
    });

    it("should return dash for null APR", () => {
      const result = formatAPR(null);
      expect(result).toBe("—");
    });

    it("should format small APR values", () => {
      const result = formatAPR(new BigNumber(0.0123));
      expect(result).toBe("1.23%");
    });

    it("should format zero APR", () => {
      const result = formatAPR(new BigNumber(0));
      expect(result).toBe("0.00%");
    });
  });
});
