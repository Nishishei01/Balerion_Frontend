import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  type SortingState,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  SquarePen,
} from "lucide-react";
import type { SubOrder } from "@/types";
import { useState, useMemo, useRef } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Field, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAllocationStore } from "@/store/useStore";
import { Button } from "../ui/button";
import EditAllocationCard from "./EditAllocationCard";

const columnHelper = createColumnHelper<SubOrder>();

export default function AllocationTable() {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [edited, setEdited] = useState<SubOrder | null>(null);

  const handleEditClick = (row: SubOrder) => {
    setEdited(row);
  };
  const handleEditClose = () => {
    setEdited(null);
  };

  const storeOrders = useAllocationStore((state) => state.orders);
  const storeSubOrders = useAllocationStore((state) => state.subOrders);

  const columns = useMemo(() => {
    const orderMap = new Map(storeOrders.map((o) => [o.id, o]));

    return [
      columnHelper.accessor("orderID", {
        header: "ORDER ID",
        cell: (info) => (
          <span className="font-semibold text-[#CBD5E1]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("id", {
        header: "SubOrder ID",
        cell: (info) => (
          <span className="font-medium text-[#94A3B8]">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor(
        (row) => {
          const order = orderMap.get(row.orderID);
          return order?.orderType;
        },
        {
          id: "type",
          header: "TYPE",
          cell: (info) => {
            const type = info.getValue();
            const typeColor =
              type === "EMERGENCY"
                ? "bg-[#7F1D1D]/50 text-[#FCA5A5] border border-[#991B1B]/50 px-3 py-1 rounded-lg text-xs font-medium flex flex-col"
                : type === "OVERDUE"
                  ? "bg-[#7C2D12]/50 text-[#FDBA74] border border-[#9A3412]/50 px-3 py-1 rounded-lg text-xs font-medium flex flex-col"
                  : "bg-[#14532D]/50 text-[#86EFAC] border border-[#166534]/50 px-3 py-1 rounded-lg text-xs font-medium flex flex-col";

            return <Badge className={typeColor}>{type}</Badge>;
          },
        },
      ),
      columnHelper.accessor("itemID", {
        header: "Item ID",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
            <span className="text-white font-bold">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor((row) => `${row.warehouseID} ${row.supplierID}`, {
        id: "source",
        header: "Source",
        cell: (info) => {
          return (
            <div>
              <span className="bg-[#3B0764]/50 text-[#D8B4FE] border border-[#6B21A8]/50 px-3 py-1 rounded-lg text-xs font-medium flex flex-col">
                <span>{info.row.original.warehouseID}</span>
                <span>{info.row.original.supplierID}</span>
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("requestQty", {
        header: "Request",
        cell: (info) => (
          <span className={`font-bold text-base text-white`}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("allocatedQty", {
        header: "Allocated",
        cell: (info) => (
          <span className="font-medium text-white">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const statusColor =
            status === "pending"
              ? "bg-[#0C4A6E]/50 text-[#7DD3FC] border border-[#075985]/50 px-3 py-1 rounded-lg text-xs font-medium flex flex-col"
              : status === "partial"
                ? "bg-[#7C2D12]/50 text-[#FDBA74] border border-[#9A3412]/50 px-3 py-1 rounded-lg text-xs font-medium flex flex-col"
                : "bg-[#14532D]/50 text-[#86EFAC] border border-[#166534]/50 px-3 py-1 rounded-lg text-xs font-medium flex flex-col";

          return (
            <div className="flex flex-row justify-between items-center gap-10">
              <Badge className={statusColor}>{status}</Badge>
              <Button onClick={() => handleEditClick(info.row.original)}>
                <SquarePen className="hover:cursor-pointer" />
              </Button>
            </div>
          );
        },
      }),
    ];
  }, [storeOrders]);

  const table = useReactTable({
    data: storeSubOrders,
    columns,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const rowVirtuailizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 74,
    overscan: 10,
  });

  return (
    <div className="flex flex-col gap-6 mb-7">
      {/* Search Bar */}
      <div className="relative max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-[#64748B]" />
        </div>
        <Input
          type="search"
          placeholder="Search.."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="text-white placeholder:text-[#64748B] bg-[#0F172A] border border-[#1E293B] pl-10 h-10 rounded-xl focus-visible:border-[#3B82F6] focus-visible:ring-[#3B82F6]/50 transition-colors shadow-none"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1E293B] bg-[#0B1320] overflow-hidden shadow-none">
        <div
          ref={tableContainerRef}
          className="max-h-[70vh] overflow-auto w-full"
        >
          <table className="w-full text-left text-sm whitespace-nowrap">
            {/* Head Table */}
            <thead className="bg-[#0F172A] border-b border-[#1E293B] sticky top-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 font-bold text-[#64748B] tracking-wider text-xs uppercase cursor-pointer select-none group hover:bg-[#1E293B]/50 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <span className="inline-flex">
                          {{
                            asc: <ArrowUp className="w-4 h-4 text-[#3B82F6]" />,
                            desc: (
                              <ArrowDown className="w-4 h-4 text-[#3B82F6]" />
                            ),
                          }[header.column.getIsSorted() as string] ??
                            (header.column.getCanSort() ? (
                              <ArrowUpDown className="w-4 h-4 text-[#334155] group-hover:text-[#64748B] transition-colors" />
                            ) : null)}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {/* Body Table */}
            <tbody className="divide-y divide-[#1E293B]">
              {rows.length > 0 ? (
                <>
                  {rowVirtuailizer.getVirtualItems().length > 0 &&
                    rowVirtuailizer.getVirtualItems()[0].start > 0 && (
                      <tr>
                        <td
                          style={{
                            height: `${rowVirtuailizer.getVirtualItems()[0].start}px`,
                          }}
                        ></td>
                      </tr>
                    )}

                  {rowVirtuailizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];

                    return (
                      <tr
                        key={row.id}
                        data-index={virtualRow.index}
                        ref={rowVirtuailizer.measureElement}
                        className="hover:bg-[#0F172A]/80 transition-colors duration-200"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 text-[#CBD5E1]"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {rowVirtuailizer.getVirtualItems().length > 0 &&
                    rowVirtuailizer.getTotalSize() -
                      rowVirtuailizer.getVirtualItems()[
                        rowVirtuailizer.getVirtualItems().length - 1
                      ].end >
                      0 && (
                      <tr>
                        <td
                          style={{
                            height: `${rowVirtuailizer.getTotalSize() - rowVirtuailizer.getVirtualItems()[rowVirtuailizer.getVirtualItems().length - 1].end}px`,
                          }}
                        ></td>
                      </tr>
                    )}
                </>
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-[#64748B] font-medium"
                  >
                    No matching orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-10 bg-[#0F172A]/80 border-t border-[#1E293B] text-white h-14 px-6">
          <div className="text-sm text-[#64748B] font-medium hidden sm:block">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
            -
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length}
          </div>
          <Field
            orientation="horizontal"
            className="w-fit flex items-center gap-2"
          >
            <FieldLabel
              htmlFor="select-rows-per-page"
              className="text-sm text-[#64748B]"
            >
              Rows per page:
            </FieldLabel>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(val) => table.setPageSize(Number(val))}
            >
              <SelectTrigger
                className="w-20 h-8 bg-[#0B1320] border-[#1E293B] focus:ring-[#3B82F6]"
                id="select-rows-per-page"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                align="start"
                className="bg-[#0F172A] border-[#1E293B] text-white"
              >
                <SelectGroup>
                  {["10", "50", "100", "500", "1000", "5000"].map(
                    (sizePage) => (
                      <SelectItem
                        key={sizePage}
                        value={sizePage}
                        className="focus:bg-[#1E293B] focus:text-white cursor-pointer"
                      >
                        {sizePage}
                      </SelectItem>
                    ),
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Pagination className="mx-0 w-auto">
            <PaginationContent className="gap-2">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50 text-[#CBD5E1]"
                      : "text-[#CBD5E1] hover:text-white hover:bg-[#1E293B] cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  className={
                    !table.getCanNextPage()
                      ? "pointer-events-none opacity-50 text-[#CBD5E1]"
                      : "text-[#CBD5E1] hover:text-white hover:bg-[#1E293B] cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Edit Card */}
      {edited && (
        <EditAllocationCard
          subOrder={edited}
          onClose={handleEditClose}
        ></EditAllocationCard>
      )}
    </div>
  );
}
