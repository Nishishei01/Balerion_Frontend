import type {
  Customer,
  Item,
  Order,
  Price,
  Stock,
  SubOrder,
  Supplier,
  Warehouse,
} from "@/types";
import { generateMockData } from "@/utils/mockData";
import { create } from "zustand";
import { calculateAllocationCost } from "@/utils/pricing";
import { bankerRound } from "@/utils/bankerRound";

const initialMockData = generateMockData();

interface AppState {
  customers: Customer[];
  items: Item[];
  prices: Price[];
  orders: Order[];
  subOrders: SubOrder[];
  stocks: Stock[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  allocationHistory: Record<string, Record<string, number>>;

  mockData: () => void;
  manualAllocate: (
    subOrderID: string,
    allocations: Record<string, number>,
  ) => void;
  autoAllocate: () => void;
}

export const useAllocationStore = create<AppState>((set) => ({
  customers: initialMockData.customers,
  items: initialMockData.items,
  prices: initialMockData.prices,
  orders: initialMockData.orders,
  subOrders: initialMockData.subOrders,
  stocks: initialMockData.stocks,
  suppliers: initialMockData.suppliers,
  warehouses: initialMockData.warehouses,
  allocationHistory: {},

  mockData: () => {
    const mockDatabase = generateMockData();
    set({
      customers: mockDatabase.customers,
      items: mockDatabase.items,
      prices: mockDatabase.prices,
      orders: mockDatabase.orders,
      subOrders: mockDatabase.subOrders,
      stocks: mockDatabase.stocks,
      suppliers: mockDatabase.suppliers,
      warehouses: mockDatabase.warehouses,
    });
  },
  manualAllocate: (subOrderID, allocations) => {
    set((state) => {
      const subOrderTarget = state.subOrders.find((s) => s.id === subOrderID);
      const orderTarget = state.orders.find(
        (o) => o.id === subOrderTarget?.orderID,
      );
      const customerTarget = state.customers.find(
        (c) => c.id === orderTarget?.customerID,
      );

      if (!subOrderTarget || !orderTarget || !customerTarget) return state;

      const oldAllocations = state.allocationHistory[subOrderID] || {};

      const oldCost = calculateAllocationCost(
        oldAllocations,
        orderTarget,
        state.stocks,
        state.prices,
      );
      const newCost = calculateAllocationCost(
        allocations,
        orderTarget,
        state.stocks,
        state.prices,
      );
      const costDelta = bankerRound(newCost - oldCost);

      const updatedCustomers = state.customers.map((c) => {
        if (c.id === customerTarget.id) {
          return {
            ...c,
            availableCredit: bankerRound(c.availableCredit - costDelta),
          };
        }
        return c;
      });

      let totalAllocatedDiff = 0;

      const updatedStocks = state.stocks.map((stock) => {
        const oldQty = oldAllocations[stock.id] || 0;
        const newQty = allocations[stock.id] || 0;
        const diff = newQty - oldQty;

        if (diff !== 0) {
          totalAllocatedDiff += diff;
          return { ...stock, qtyOnHand: stock.qtyOnHand - diff };
        }
        return stock;
      });

      const updatedSubOrder = state.subOrders.map((sub) => {
        if (sub.id === subOrderID) {
          const newAllocatedQty = sub.allocatedQty + totalAllocatedDiff;
          let newStatus: typeof sub.status;

          if (newAllocatedQty >= sub.requestQty) {
            newStatus = "full";
          } else if (newAllocatedQty > 0) {
            newStatus = "partial";
          } else {
            newStatus = "pending";
          }

          return { ...sub, allocatedQty: newAllocatedQty, status: newStatus };
        }
        return sub;
      });

      return {
        stocks: updatedStocks,
        subOrders: updatedSubOrder,
        customers: updatedCustomers,
        allocationHistory: {
          ...state.allocationHistory,
          [subOrderID]: allocations,
        },
      };
    });
  },
  autoAllocate: () => {
    set((state) => {
      const baseSubOrders = state.subOrders.map((s) => ({ ...s }));
      const baseStocks = state.stocks.map((s) => ({ ...s }));
      const baseCustomer = state.customers.map((c) => ({ ...c }));
      const baseHistory = { ...state.allocationHistory };
      const priorityTypeScore = { EMERGENCY: 3, OVERDUE: 2, DAILY: 1 };

      const orderMap = new Map(state.orders.map((o) => [o.id, o]));
      const customerIndexMap = new Map(baseCustomer.map((c, i) => [c.id, i]));
      const priceMap = new Map(
        state.prices.map((p) => [
          `${p.itemID}-${p.supplierID}-${p.orderType}`,
          p.price,
        ]),
      );

      // หาsub order ที่ยังไม่เต็มแล้วเรียงตามระดับความสำคัญ
      const pendingSuborders = baseSubOrders.filter((s) => s.status != "full");
      pendingSuborders.sort((a, b) => {
        const orderA = orderMap.get(a.orderID);
        const orderB = orderMap.get(b.orderID);

        if (!orderA || !orderB) return 0;

        const scoreA = priorityTypeScore[orderA.orderType];
        const scoreB = priorityTypeScore[orderB.orderType];

        if (scoreA === scoreB) {
          const createdDateA = new Date(orderA.createdDate).getTime();
          const createdDateB = new Date(orderB.createdDate).getTime();

          return createdDateA - createdDateB;
        }

        return scoreB - scoreA;
      });

      // ลูปเพื่อคำนวณแก้ไขข้อมูลทีละ sub order
      for (const subOrder of pendingSuborders) {
        const availableStock = baseStocks.filter((s) => {
          const matchItem = s.itemID === subOrder.itemID;
          const matchWH =
            s.warehouseID === subOrder.warehouseID ||
            subOrder.warehouseID === "WH-000";
          const matchSP =
            s.supplierID === subOrder.supplierID ||
            subOrder.supplierID === "SP-000";

          return matchItem && matchWH && matchSP && s.qtyOnHand > 0;
        });
        availableStock.sort((a, b) => b.qtyOnHand - a.qtyOnHand);

        const order = orderMap.get(subOrder.orderID);
        const customerIdex = customerIndexMap.get(order?.customerID || "");
        if (!order || customerIdex === undefined) continue;
        const customer = baseCustomer[customerIdex];

        const history = baseHistory[subOrder.id] || {};
        const currentTotalAllocate = Object.values(history).reduce(
          (sum, num) => sum + num,
          0,
        );
        let remainQty = subOrder.requestQty - currentTotalAllocate;

        if (remainQty <= 0) continue;

        for (const stock of availableStock) {
          if (remainQty <= 0) break;
          if (stock.qtyOnHand <= 0) continue;
          if (customer.availableCredit <= 0) break;

          let takeQty = Math.min(stock.qtyOnHand, remainQty);

          const unitPrice =
            priceMap.get(
              `${stock.itemID}-${stock.supplierID}-${order.orderType}`,
            ) || 0;

          if (unitPrice > 0) {
            const canBuyQty = Math.floor(customer.availableCredit / unitPrice);

            takeQty = Math.min(takeQty, canBuyQty);
          }

          if (takeQty <= 0) continue;

          const cost = takeQty * unitPrice;

          remainQty -= takeQty;
          stock.qtyOnHand -= takeQty;
          customer.availableCredit = bankerRound(
            customer.availableCredit - cost,
          );

          if (!baseHistory[subOrder.id]) baseHistory[subOrder.id] = {};
          baseHistory[subOrder.id][stock.id] =
            (baseHistory[subOrder.id][stock.id] || 0) + takeQty;
        }

        const finalAllocated = Object.values(
          baseHistory[subOrder.id] || {},
        ).reduce((sum, num) => sum + num, 0);

        if (finalAllocated >= subOrder.requestQty) {
          subOrder.status = "full";
        } else if (finalAllocated > 0) {
          subOrder.status = "partial";
        }
        subOrder.allocatedQty = finalAllocated;
      }

      return {
        subOrders: baseSubOrders,
        stocks: baseStocks,
        customers: baseCustomer,
        allocationHistory: baseHistory,
      };
    });
  },
}));
