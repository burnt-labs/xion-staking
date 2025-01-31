import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import BigNumber from "bignumber.js";

import { REST_API_URL } from "@/config";

export const sortUtil = (a: unknown, b: unknown, isAsc: boolean) => {
  if (typeof a !== typeof b) {
    return 0;
  }

  if (typeof a === "string") {
    return isAsc
      ? a.localeCompare(b as string)
      : (b as string).localeCompare(a);
  }

  if (typeof a === "number") {
    if (Number.isNaN(a) || Number.isNaN(b as number)) {
      return 0;
    }

    return isAsc ? a - (b as number) : (b as number) - a;
  }

  if (a instanceof BigNumber && b instanceof BigNumber) {
    return isAsc ? a.minus(b).toNumber() : b.minus(a).toNumber();
  }

  return 0;
};

export async function fetchFromAPI<T>(
  endpoint: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axios.get(
      `${REST_API_URL}${endpoint}`,
      {
        ...config,
      },
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to fetch from API: ${endpoint}`, error);
    throw error;
  }
}
