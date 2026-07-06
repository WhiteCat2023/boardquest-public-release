import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Search...",
}: DataTableProps<TData, TValue>) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageSize] = useState(10);

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize },
        },
    });

    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages  = table.getPageCount();

    return (
        <div className="flex flex-col gap-4">
            {/* Search bar */}
            {searchKey !== undefined || true ? (
                <div className="relative w-full max-w-sm">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                        type="text"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A70202]/20 focus:border-[#A70202] transition-all"
                    />
                </div>
            ) : null}

            {/* Table */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-100"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-b border-gray-50 hover:bg-[#E9B0B0]/10 transition-colors duration-100"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 px-3">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-36 text-center text-sm text-gray-400"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-gray-400">
                    Showing{" "}
                    <span className="font-medium text-gray-600">
                        {table.getFilteredRowModel().rows.length === 0
                            ? 0
                            : (currentPage - 1) * pageSize + 1}
                    </span>
                    {" "}–{" "}
                    <span className="font-medium text-gray-600">
                        {Math.min(currentPage * pageSize, table.getFilteredRowModel().rows.length)}
                    </span>
                    {" "}of{" "}
                    <span className="font-medium text-gray-600">
                        {table.getFilteredRowModel().rows.length}
                    </span>{" "}
                    results
                </p>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 hover:text-[#A70202] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                        <ChevronLeft size={15} />
                    </button>

                    <span className="text-xs text-gray-500 tabular-nums min-w-[5rem] text-center">
                        Page {currentPage} of {totalPages || 1}
                    </span>

                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 hover:text-[#A70202] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}
