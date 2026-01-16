import BigNumber from "bignumber.js";
import { describe, expect, it } from "vitest";

import {
  coinIsPositive,
  getEmptyXionCoin,
  getUXionCoinFromXion,
  getXionCoin,
  getXionCoinFromUXion,
  normaliseCoin,
  sumAllCoins,
} from "./coins";

describe("coins utilities", () => {
  describe("normaliseCoin", () => {
    it("should convert UXION to XION with correct decimal places", () => {
      const result = normaliseCoin({ amount: "1000000", denom: "uxion" });
      expect(result).toEqual({ amount: "1", denom: "XION" });
    });

    it("should handle large UXION amounts", () => {
      const result = normaliseCoin({ amount: "1234567890", denom: "UXION" });
      expect(result).toEqual({ amount: "1234.56789", denom: "XION" });
    });

    it("should handle small UXION amounts", () => {
      const result = normaliseCoin({ amount: "100", denom: "uxion" });
      expect(result).toEqual({ amount: "0.0001", denom: "XION" });
    });

    it("should return XION as-is", () => {
      const result = normaliseCoin({ amount: "100.5", denom: "XION" });
      expect(result).toEqual({ amount: "100.5", denom: "XION" });
    });

    it("should uppercase other denominations", () => {
      const result = normaliseCoin({ amount: "500", denom: "atom" });
      expect(result).toEqual({ amount: "500", denom: "ATOM" });
    });

    it("should handle zero amounts", () => {
      const result = normaliseCoin({ amount: "0", denom: "uxion" });
      expect(result).toEqual({ amount: "0", denom: "XION" });
    });
  });

  describe("getEmptyXionCoin", () => {
    it("should return a zero XION coin", () => {
      const result = getEmptyXionCoin();
      expect(result).toEqual({ amount: "0", denom: "XION" });
    });
  });

  describe("getXionCoin", () => {
    it("should create XION coin from BigNumber", () => {
      const result = getXionCoin(new BigNumber(100));
      expect(result).toEqual({ amount: "100", denom: "XION" });
    });

    it("should handle decimal BigNumber values", () => {
      const result = getXionCoin(new BigNumber("123.456"));
      expect(result).toEqual({ amount: "123.456", denom: "XION" });
    });
  });

  describe("getXionCoinFromUXion", () => {
    it("should convert UXION BigNumber to XION coin", () => {
      const result = getXionCoinFromUXion(new BigNumber("1000000"));
      expect(result).toEqual({ amount: "1", denom: "XION" });
    });

    it("should handle fractional conversions", () => {
      const result = getXionCoinFromUXion(new BigNumber("1500000"));
      expect(result).toEqual({ amount: "1.5", denom: "XION" });
    });
  });

  describe("getUXionCoinFromXion", () => {
    it("should convert XION BigNumber to UXION coin", () => {
      const result = getUXionCoinFromXion(new BigNumber("1"));
      expect(result).toEqual({ amount: "1000000", denom: "UXION" });
    });

    it("should handle fractional XION values", () => {
      const result = getUXionCoinFromXion(new BigNumber("1.5"));
      expect(result).toEqual({ amount: "1500000", denom: "UXION" });
    });
  });

  describe("coinIsPositive", () => {
    it("should return true for positive amounts", () => {
      expect(coinIsPositive({ amount: "100", denom: "XION" })).toBe(true);
    });

    it("should return falsy for zero amounts", () => {
      expect(coinIsPositive({ amount: "0", denom: "XION" })).toBeFalsy();
    });

    it("should return falsy for negative amounts", () => {
      expect(coinIsPositive({ amount: "-100", denom: "XION" })).toBeFalsy();
    });

    it("should return falsy for null", () => {
      expect(coinIsPositive(null)).toBeFalsy();
    });
  });

  describe("sumAllCoins", () => {
    it("should sum multiple XION coins", () => {
      const coins = [
        { amount: "100", denom: "XION" },
        { amount: "200", denom: "XION" },
        { amount: "50", denom: "XION" },
      ];
      const result = sumAllCoins(coins);
      expect(result).toEqual({ amount: "350", denom: "XION" });
    });

    it("should normalise and sum UXION coins", () => {
      const coins = [
        { amount: "1000000", denom: "UXION" },
        { amount: "2000000", denom: "UXION" },
      ];
      const result = sumAllCoins(coins);
      expect(result).toEqual({ amount: "3", denom: "XION" });
    });

    it("should return zero for empty array", () => {
      const result = sumAllCoins([]);
      expect(result).toEqual({ amount: "0", denom: "XION" });
    });

    it("should handle mixed XION and UXION coins", () => {
      const coins = [
        { amount: "1", denom: "XION" },
        { amount: "1000000", denom: "UXION" },
      ];
      const result = sumAllCoins(coins);
      expect(result).toEqual({ amount: "2", denom: "XION" });
    });

    it("should handle decimal amounts", () => {
      const coins = [
        { amount: "1.5", denom: "XION" },
        { amount: "2.25", denom: "XION" },
      ];
      const result = sumAllCoins(coins);
      expect(result).toEqual({ amount: "3.75", denom: "XION" });
    });
  });
});
