import type { ComponentType } from "react";

import FinancialFreedomPreland from "./financial-freedom";

export type PrelandComponentProps = {
  onContinue: () => void;
};

export type PrelandName = keyof typeof prelandRegistry;

// How to add a new prelanding:
// 1. Create a client component in this folder, for example `retirement-plan.tsx`.
// 2. The component must accept `onContinue` and call it from its CTA button.
// 3. Import it here and add it to `prelandRegistry` with a stable URL key.
// 4. Use it with `/iul-v6?preland=your_key`; tracking params stay in the URL
//    because the funnel only removes the `preland` param after the CTA.
const prelandRegistry = {
  financial_freedom: FinancialFreedomPreland,
} satisfies Record<string, ComponentType<PrelandComponentProps>>;

export function getPrelandComponent(name?: string | null) {
  const key = String(name || "").trim();
  if (!key) return null;

  return prelandRegistry[key as PrelandName] || null;
}
