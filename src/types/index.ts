export interface Customer {
  id: string;
  creditLimit: number;
  availableCredit: number;
}

export interface Item {
  id: string;
}

export interface Warehouse {
  id: string;
}

export interface Supplier {
  id: string;
}

export type OrderType = "DAILY" | "OVERDUE" | "EMERGENCY";

export type OrderStatus = "pending" | "allocated" | "partial";

export interface Order {
  id: string;

  customerID: string;

  orderType: OrderType;

  createdDate: string;

  status: OrderStatus;

  remark?: string;
}

export type SubOrderStatus = "pending" | "partial" | "full";

export interface SubOrder {
  id: string;

  orderID: string;

  itemID: string;

  warehouseID: string;

  supplierID: string;

  requestQty: number;

  allocatedQty: number;

  status: SubOrderStatus;
}

export interface Stock {
  id: string;

  warehouseID: string;

  supplierID: string;

  itemID: string;

  qtyOnHand: number;
}

export interface Price {
  id: string;

  itemID: string;

  supplierID: string;

  orderType: OrderType;

  price: number;
}

// export interface Allocation {
//   id: string;

//   subOrderID: string;

//   warehouseID: string;

//   supplierID: string;

//   allocatedQty: number;

//   unitPrice: number;

//   amount: number;
// }
