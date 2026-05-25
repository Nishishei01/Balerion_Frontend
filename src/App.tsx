import "./App.css";
import { Fish, ListOrdered, TrendingUp, Anchor } from "lucide-react";
import { Card } from "@/components/ui/card";
import AllocationTable from "./components/allocation/AllocationTable";
import { useAllocationStore } from "./store/useStore";
import { useEffect } from "react";

function App() {
  const storeOrders = useAllocationStore((state) => state.orders);
  const storeSubOrders = useAllocationStore((state) => state.subOrders);
  const storeStocks = useAllocationStore((state) => state.stocks);
  const autoAllocate = useAllocationStore((state) => state.autoAllocate);

  useEffect(() => {
    autoAllocate();
  }, [autoAllocate]);

  const totalOrders = storeOrders.length;
  const totalDemand = storeSubOrders.reduce(
    (sum, item) => sum + item.requestQty,
    0,
  );
  const totalSupply = storeStocks.reduce(
    (sum, item) => sum + item.qtyOnHand,
    0,
  );

  const titleCard = [
    {
      no: 1,
      title: "TOTAL ORDERS",
      num: totalOrders,
      icon: ListOrdered,
      iconColor: "#3B82F6",
    },
    {
      no: 2,
      title: "TOTAL DEMAND",
      num: totalDemand,
      icon: TrendingUp,
      iconColor: "#3B82F6",
    },
    {
      no: 3,
      title: "TOTAL SALMON STOCK",
      num: totalSupply,
      icon: Fish,
      iconColor: "#FA8072",
    },
  ];

  return (
    <div className="w-full max-w-400 mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
      {/* Logo and Brand */}
      <div className="text-left text-cyan-50 flex items-center justify-center gap-3 mt-5">
        <Anchor
          size={70}
          className="text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] mr-2"
        />
        <div className="flex flex-col items-center">
          <h1 className="text-white font-bold text-[40px] m-0 tracking-tight">
            Allocation Engine
          </h1>
          <p className="text-[#7FA1D6] text-sm font-medium text-center">
            Manage and allocate {storeSubOrders.length.toLocaleString()} active
            orders seamlessly.
          </p>
        </div>
      </div>
      {/* Total Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 mb-8">
        {titleCard.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.no}
              size="sm"
              className="flex-1 bg-[#0F172A] border border-[#1E293B] shadow-none p-6 flex flex-row items-center justify-center rounded-2xl transition-all duration-300 hover:border-[#3B82F6]/50 hover:bg-[#131C31]"
            >
              <div className="bg-[#1E293B] rounded-[10px] w-14 h-14 flex items-center justify-center shrink-0 mr-5">
                <Icon size={24} color={card.iconColor} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col justify-center text-left">
                <span className="text-[#64748B] text-xs font-bold tracking-widest mb-1.5 uppercase">
                  {card.title}
                </span>
                <span className="text-white text-[28px] font-bold leading-none text-center">
                  {card.num.toLocaleString()}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
      {/* Table */}
      <AllocationTable></AllocationTable>
    </div>
  );
}

export default App;
