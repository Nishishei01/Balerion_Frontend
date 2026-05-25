import type { Order, Price, Stock } from "@/types";
import { bankerRound } from "./bankerRound";

// ฟังชั่นคิดผลรวมของราคาทั้งหมดที่เอามาจาก stock
export function calculateAllocationCost(
  allocations: Record<string, number>,
  order: Order,
  stocks: Stock[],
  prices: Price[],
) {
  let totalCost = 0;

  for (const [stockID, qty] of Object.entries(allocations)) {
    if (qty <= 0) continue;

    const stock = stocks.find((s) => s.id === stockID);
    if (!stock) continue;

    const priceRecord = prices.find(
      (p) =>
        p.itemID === stock.itemID &&
        p.supplierID === stock.supplierID &&
        p.orderType === order.orderType,
    );

    const unitPrice = priceRecord ? priceRecord.price : 0;
    totalCost += unitPrice * qty;
  }

  return bankerRound(totalCost);
}

// ฟังชั่นไว้getราคาของโดยอิงจากsupplierด้วย
export function getUnitPrice(
  stockId: string,
  order: Order,
  stocks: Stock[],
  prices: Price[],
) {
  const stock = stocks.find((s) => s.id === stockId);
  if (!stock) return 0;

  const priceRecord = prices.find(
    (p) =>
      p.itemID === stock.itemID &&
      p.supplierID === stock.supplierID &&
      p.orderType === order.orderType,
  );

  return priceRecord ? priceRecord.price : 0;
}
