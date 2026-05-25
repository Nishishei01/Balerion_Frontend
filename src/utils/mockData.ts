import type {
  Customer,
  Item,
  Order,
  OrderType,
  Price,
  Stock,
  SubOrder,
  Supplier,
  Warehouse,
} from "../types/index";
import { bankerRound } from "./bankerRound";

export const generateMockData = () => {
  const numCustomers = 50;
  const numItems = 15;
  const numWarehouse = 5;
  const numSupplier = 10;
  const numOrder = 5000;

  // Customers
  const customers: Customer[] = Array.from({ length: numCustomers }, (_, i) => {
    const limit = 500000 + Math.floor(Math.random() * 5000000);
    return {
      id: `CT-${String(i + 1).padStart(4, "0")}`,
      creditLimit: limit,
      availableCredit: limit,
    };
  });

  // Items
  const items: Item[] = Array.from({ length: numItems }, (_, i) => {
    return {
      id: `Item-${String(i + 1).padStart(2, "0")}`,
    };
  });

  // Warehouses
  const warehouses: Warehouse[] = Array.from(
    { length: numWarehouse },
    (_, i) => {
      return {
        id: `WH-${String(i + 1).padStart(3, "0")}`,
      };
    },
  );
  warehouses.push({ id: `WH-000` });

  // Supplier
  const suppliers: Supplier[] = Array.from({ length: numSupplier }, (_, i) => {
    return {
      id: `SP-${String(i + 1).padStart(3, "0")}`,
    };
  });
  suppliers.push({ id: `SP-000` });

  // Order
  const orderType: OrderType[] = ["DAILY", "OVERDUE", "EMERGENCY"];
  const orders: Order[] = Array.from({ length: numOrder }, (_, i) => {
    const randomCustomer =
      customers[Math.floor(Math.random() * customers.length)];
    const randomDate = new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
    );
    const selectedOrderType =
      orderType[Math.floor(Math.random() * orderType.length)];

    return {
      id: `ORDER-${String(i + 1).padStart(4, "0")}`,
      customerID: randomCustomer.id,
      orderType: selectedOrderType,
      createdDate: randomDate.toISOString().split("T")[0],
      status: "pending",
      remark: selectedOrderType === "EMERGENCY" ? "Special for VIP" : undefined,
    };
  });

  // SubOrder
  const subOrders: SubOrder[] = [];
  orders.forEach((order) => {
    const maxItemsNumber = Math.min(5, items.length);
    const numItemInOrder = 1 + Math.floor(Math.random() * maxItemsNumber);

    const shuffledItems = [...items].sort(() => 0.5 - Math.random());
    const selectedItems = shuffledItems.slice(0, numItemInOrder);

    for (let i = 0; i < selectedItems.length; i++) {
      const warehouseID =
        Math.random() > 0.5
          ? "WH-000"
          : warehouses[Math.floor(Math.random() * (warehouses.length - 1))].id;
      const supplierID =
        Math.random() > 0.5
          ? "SP-000"
          : suppliers[Math.floor(Math.random() * (warehouses.length - 1))].id;

      subOrders.push({
        id: `${order.id}-${String(i + 1).padStart(3, "0")}`,
        orderID: order.id,
        itemID: selectedItems[i].id,
        warehouseID: warehouseID,
        supplierID: supplierID,
        requestQty: 10 + Math.floor(Math.random() * 100),
        allocatedQty: 0,
        status: "pending",
      });
    }
  });

  // Stock
  const stocks: Stock[] = [];
  let stockIDCounter = 1;
  items.forEach((item) => {
    const validWarehouses = warehouses.filter((w) => w.id !== "WH-000");
    const validSuppliers = suppliers.filter((s) => s.id !== "SP-000");

    const numWarehousesInItem =
      1 + Math.floor(Math.random() * validWarehouses.length);
    const shuffledWarehouses = [...validWarehouses].sort(
      () => 0.5 - Math.random(),
    );
    const selectedWarehouses = shuffledWarehouses.slice(0, numWarehousesInItem);

    for (let w = 0; w < selectedWarehouses.length; w++) {
      const numSupplierInWarehouse =
        1 + Math.floor(Math.random() * validSuppliers.length);
      const shuffledSuppliers = [...validSuppliers].sort(
        () => 0.5 - Math.random(),
      );
      const selectedSuppliers = shuffledSuppliers.slice(
        0,
        numSupplierInWarehouse,
      );

      for (let s = 0; s < selectedSuppliers.length; s++) {
        stocks.push({
          id: `ST-${String(stockIDCounter++).padStart(5, "0")}`,
          warehouseID: selectedWarehouses[w].id,
          supplierID: selectedSuppliers[s].id,
          itemID: item.id,
          qtyOnHand: Math.floor(Math.random() * 500),
        });
      }
    }
  });

  // Price
  const prices: Price[] = [];
  let priceIdCounter = 1;
  const validSuppliers = suppliers.filter((s) => s.id !== "SP-000");
  items.forEach((item) => {
    validSuppliers.forEach((supplier) => {
      const basePrice = 100 + Math.floor(Math.random() * 1000);
      orderType.forEach((type) => {
        const multiplier =
          type === "EMERGENCY" ? 2 : type === "OVERDUE" ? 1.5 : 1;

        prices.push({
          id: `P-${String(priceIdCounter++).padStart(4, "0")}`,
          itemID: item.id,
          supplierID: supplier.id,
          orderType: type,
          price: bankerRound(basePrice * multiplier),
        });
      });
    });
  });

  // ไว้เรียงแสดงข้อมูลในตารางเริ่มต้น type สำคัญขึ้นก่อน
  const orderMap = new Map(orders.map((o) => [o.id, o]));
  const typeScore = { EMERGENCY: 3, OVERDUE: 2, DAILY: 1 };
  subOrders.sort((a, b) => {
    const orderA = orderMap.get(a.orderID);
    const orderB = orderMap.get(b.orderID);

    if (!orderA || !orderB) return 0;
    const scoreA = typeScore[orderA.orderType];
    const scoreB = typeScore[orderB.orderType];

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    const timeA = new Date(orderA.createdDate).getTime();
    const timeB = new Date(orderB.createdDate).getTime();
    return timeA - timeB;
  });

  const mockDatabase = {
    customers,
    items,
    warehouses,
    suppliers,
    orders,
    subOrders,
    stocks,
    prices,
  };
  return mockDatabase;
};
