import { useAllocationStore } from "@/store/useStore";
import type { SubOrder } from "@/types";

// ฟังชั่นหาstockที่ตรงกับsub order
export const getAvailableStock = (subOrder: SubOrder) => {
  const state = useAllocationStore.getState();

  let availableStock = state.stocks.filter((i) => i.itemID === subOrder.itemID);

  if (subOrder.warehouseID !== "WH-000") {
    availableStock = availableStock.filter(
      (w) => w.warehouseID === subOrder.warehouseID,
    );
  }

  if (subOrder.supplierID !== "SP-000") {
    availableStock = availableStock.filter(
      (s) => s.supplierID === subOrder.supplierID,
    );
  }

  return availableStock;
};
