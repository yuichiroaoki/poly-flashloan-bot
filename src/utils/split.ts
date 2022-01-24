import { routeParts } from "../config";

export const getRouteParts = (length: number) => {
  try {
    return routeParts[length - 1];
  } catch {
    throw new Error(`Route length ${length} is not supported`);
  }
};

export const toInt = (float: number) => {
  return float * 100;
};
