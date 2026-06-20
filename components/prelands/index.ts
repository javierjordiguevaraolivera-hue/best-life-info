import type { ComponentType } from "react";

import FinancialFreedomPreland from "./financial-freedom";

export type PrelandComponentProps = {
  onContinue: () => void;
};

export type PrelandName = keyof typeof prelandRegistry;

const prelandRegistry = {
  financial_freedom: FinancialFreedomPreland,
} satisfies Record<string, ComponentType<PrelandComponentProps>>;

export function getPrelandComponent(name?: string | null) {
  const key = String(name || "").trim();
  if (!key) return null;

  return prelandRegistry[key as PrelandName] || null;
}
