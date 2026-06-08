import { AppError } from "./app-error";

export const getStringQuery = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export const getRequiredParam = (value: unknown, fieldName: string): string => {
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError(400, `${fieldName} is required.`);
  }

  return value;
};
