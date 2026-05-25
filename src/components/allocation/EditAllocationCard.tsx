import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { X, Package, CheckCircle2, Box, Truck } from "lucide-react";
import type { SubOrder } from "@/types";
import { getAvailableStock } from "@/utils/allocation";
import { useState } from "react";
import { useAllocationStore } from "@/store/useStore";
import { calculateAllocationCost, getUnitPrice } from "@/utils/pricing";
import { bankerRound } from "@/utils/bankerRound";

interface EditAllocationProps {
  subOrder: SubOrder;
  onClose: () => void;
}

export default function EditAllocationCard({
  subOrder,
  onClose,
}: EditAllocationProps) {
  const availableStocks = getAvailableStock(subOrder);

  const history = useAllocationStore(
    (state) => state.allocationHistory[subOrder.id],
  );
  const safeHistory = history || {};

  const [allocations, setAllocations] =
    useState<Record<string, number>>(safeHistory);

  const totalSelected = Object.values(allocations).reduce(
    (sum, val) => sum + val,
    0,
  );

  const absoluteRemainQty = subOrder.requestQty;
  const isOverAllocated = totalSelected > absoluteRemainQty;

  const order = useAllocationStore((state) =>
    state.orders.find((o) => o.id === subOrder.orderID),
  );
  const customer = useAllocationStore((state) =>
    state.customers.find((c) => c.id === order?.customerID),
  );
  const stocks = useAllocationStore((state) => state.stocks);
  const prices = useAllocationStore((state) => state.prices);

  const oldCost =
    order && customer
      ? calculateAllocationCost(safeHistory, order, stocks, prices)
      : 0;
  const newCost =
    order && customer
      ? calculateAllocationCost(allocations, order, stocks, prices)
      : 0;
  const costDelta = bankerRound(newCost - oldCost);

  const availableCredit = customer?.availableCredit || 0;
  const remainingCredit = bankerRound(availableCredit - costDelta);
  const isCreditExceeded = remainingCredit < 0;

  const isUnchanged =
    JSON.stringify(allocations) === JSON.stringify(safeHistory);
  const isConfirmDisabled = isOverAllocated || isUnchanged || isCreditExceeded;

  const manualAllocate = useAllocationStore((state) => state.manualAllocate);

  const handleInputChange = (
    stockId: string,
    value: string,
    maxLimit: number,
  ) => {
    const numValue = parseInt(value, 10);
    setAllocations((prev) => {
      let val = isNaN(numValue) ? 0 : Math.max(0, numValue);
      val = Math.min(val, maxLimit);
      return {
        ...prev,
        [stockId]: val,
      };
    });
  };

  const handleConfirm = () => {
    manualAllocate(subOrder.id, allocations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col p-0 bg-[#0F172A] border-[#1E293B] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1E293B] bg-[#131C31]">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/10 p-2 rounded-lg">
              <Package size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                Manual Allocation
              </h2>
              <p className="text-[#64748B] text-xs font-medium">
                Order: {subOrder.orderID}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-white transition-colors p-1 rounded-md hover:bg-[#1E293B]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Order Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#131C31] p-3 rounded-xl border border-[#1E293B]">
              <span className="block text-[#64748B] text-[10px] font-bold mb-1 uppercase tracking-wider">
                SubOrder ID
              </span>
              <div className="text-white text-sm font-medium">
                {subOrder.id}
              </div>
            </div>
            <div className="bg-[#131C31] p-3 rounded-xl border border-[#1E293B]">
              <span className="block text-[#64748B] text-[10px] font-bold mb-1 uppercase tracking-wider">
                Item
              </span>
              <div className="flex items-center gap-2 text-white text-sm font-medium justify-center">
                {subOrder.itemID}
              </div>
            </div>
            <div className="bg-[#131C31] p-3 rounded-xl border border-[#1E293B]">
              <span className="block text-[#64748B] text-[10px] font-bold mb-1 uppercase tracking-wider">
                Request Qty
              </span>
              <div className="text-white text-sm font-medium">
                {subOrder.requestQty.toLocaleString()}
              </div>
            </div>
            <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
              <span className="block text-cyan-400 text-[10px] font-bold mb-1 uppercase tracking-wider">
                Unallocated
              </span>
              <div className="text-cyan-400 text-sm font-bold">
                {Math.max(
                  0,
                  subOrder.requestQty - totalSelected,
                ).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Customer Credit Info */}
          <div className="p-4 bg-[#1E293B] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-[#334155] rounded-xl">
            <div className="flex items-center justify-between w-full md:w-auto gap-2">
              <span className="text-[#94A3B8] text-sm">Available Credit:</span>
              <span className="text-white font-bold">
                $
                {availableCredit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between w-full md:w-auto gap-2">
              <span className="text-[#94A3B8] text-sm">Credit Diff:</span>
              <span
                className={`font-bold ${costDelta > 0 ? "text-red-400" : costDelta < 0 ? "text-green-400" : "text-white"}`}
              >
                {costDelta < 0 ? "+" : costDelta > 0 ? "-" : ""}$
                {Math.abs(costDelta).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between w-full md:w-auto gap-2">
              <span className="text-[#94A3B8] text-sm">Remaining Credit:</span>
              <span
                className={`font-bold ${isCreditExceeded ? "text-red-500" : "text-cyan-400"}`}
              >
                $
                {remainingCredit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Warehouse and Supplier Tag*/}
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="bg-[#1E293B]/50 text-[#94A3B8] border-[#334155]"
            >
              <Box size={12} className="mr-1" /> WH: {subOrder.warehouseID}
            </Badge>
            <Badge
              variant="outline"
              className="bg-[#1E293B]/50 text-[#94A3B8] border-[#334155]"
            >
              <Truck size={12} className="mr-1" /> SP: {subOrder.supplierID}
            </Badge>
          </div>

          {/* Available Stocks List */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm">Available Stocks</h3>
            <p className="text-[#64748B] text-xs">
              Select amount to deduct from each available warehouse/supplier.
            </p>

            <div className="border border-[#1E293B] rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 bg-[#131C31] p-3 border-b border-[#1E293B] text-[#64748B] text-xs font-bold uppercase tracking-wider">
                <div className="col-span-3">Warehouse</div>
                <div className="col-span-3">Supplier</div>
                <div className="col-span-3 text-right">Available</div>
                <div className="col-span-3 text-right">Allocate Amount</div>
              </div>
              <div className="divide-y divide-[#1E293B]">
                {availableStocks.length > 0 ? (
                  availableStocks.map((stock) => (
                    <div
                      key={stock.id}
                      className="grid grid-cols-12 gap-2 items-center p-3 hover:bg-[#131C31]/50 transition-colors"
                    >
                      <div className="col-span-3 text-white text-sm font-medium">
                        {stock.warehouseID}
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Truck size={14} className="text-[#64748B]" />
                          <span className="text-[#94A3B8] text-xs font-medium">
                            {stock.supplierID}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-400 font-medium">
                          $
                          {order
                            ? getUnitPrice(stock.id, order, stocks, prices)
                            : 0}{" "}
                          / piece
                        </div>
                      </div>
                      <div className="col-span-3 text-right text-[#94A3B8] text-sm">
                        {stock.qtyOnHand.toLocaleString()}
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="1"
                          onKeyDown={(e) => {
                            if (
                              e.key === "." ||
                              e.key === "-" ||
                              e.key === "+"
                            ) {
                              e.preventDefault();
                            }
                          }}
                          value={
                            allocations[stock.id] === 0
                              ? ""
                              : allocations[stock.id] || ""
                          }
                          onChange={(e) => {
                            const previousAllocated =
                              safeHistory[stock.id] || 0;
                            const dynamicMaxLimit =
                              stock.qtyOnHand + previousAllocated;
                            handleInputChange(
                              stock.id,
                              e.target.value,
                              dynamicMaxLimit,
                            );
                          }}
                          className="h-8 bg-[#0F172A] border-[#1E293B] text-white text-right focus-visible:ring-cyan-500 font-bold"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-[#64748B]">
                    <Package size={32} className="mb-2 opacity-20" />
                    <p className="text-sm font-medium">Out of Stock</p>
                    <p className="text-xs">
                      No available stock matches this order's criteria.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Row */}
            <div
              className={`flex justify-between items-center bg-[#131C31] p-4 rounded-xl border border-[#1E293B] ${
                isOverAllocated || isCreditExceeded
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-[#131C31] border-[#1E293B]"
              }`}
            >
              <span
                className={
                  isOverAllocated || isCreditExceeded
                    ? "text-red-400 text-sm font-bold"
                    : "text-[#94A3B8] text-sm font-medium"
                }
              >
                {isOverAllocated
                  ? "Error: Allocated amount exceeds remaining quantity!"
                  : isCreditExceeded
                    ? "Error: Insufficient customer credit!"
                    : "Total Selected:"}
              </span>
              <span
                className={`font-bold text-xl ${isOverAllocated ? "text-red-400" : "text-white"}`}
              >
                {totalSelected.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#1E293B] bg-[#131C31] flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
          >
            Cancel
          </Button>
          <Button
            disabled={isConfirmDisabled}
            onClick={handleConfirm}
            className={`font-bold flex items-center gap-2 px-6 transition-all ${
              isConfirmDisabled
                ? "bg-[#1E293B] text-[#64748B] cursor-not-allowed opacity-50"
                : "bg-cyan-500 hover:bg-cyan-600 text-white"
            }`}
          >
            <CheckCircle2 size={18} />
            Confirm
          </Button>
        </div>
      </Card>
    </div>
  );
}
