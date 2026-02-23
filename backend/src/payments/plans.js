export const RAZORPAY_PLAN_PRICES = Object.freeze({
  starter: 199,
  pro: 399,
  yearly: 1999,
  lifetime: 6999,
});

export function planAmountPaise(plan) {
  const rupees = RAZORPAY_PLAN_PRICES[plan];
  if (!rupees) return null;
  return rupees * 100;
}

export function isValidPlan(plan) {
  return Object.prototype.hasOwnProperty.call(RAZORPAY_PLAN_PRICES, plan);
}

export function isExpectedPlanAmount(plan, amountPaise) {
  const expected = planAmountPaise(plan);
  return Number.isFinite(expected) && Number(amountPaise) === expected;
}
