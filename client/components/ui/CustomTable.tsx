"use client";
import { Pagination, Select, SelectItem, Skeleton } from "@heroui/react";
import {
  SortDescriptor,
  Selection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { useMemo } from "react";

export interface Column {
  name: string;
  uid: string;
  sortable?: boolean;
}

interface CustomTableProps {
  items: any[];
  isLoading: boolean;
  lastPage: number;
  perPage: number;
  setPerPage: (perPage: number) => void;
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
  sortDescriptor: SortDescriptor;
  setSortDescriptor: (sortDescriptor: SortDescriptor) => void;
  renderCell: (item: any, columnKey: React.Key) => React.ReactNode;
  columns: Column[];
  visibleColumns?: "all" | Selection;
  loadingState?: React.ReactNode;
  emptyState?: React.ReactNode;
  ariaLabel?: string;
}

const CustomTable: React.FC<CustomTableProps> = ({
  items,
  isLoading,
  lastPage,
  perPage,
  setPerPage,
  currentPage,
  setCurrentPage,
  sortDescriptor,
  setSortDescriptor,
  renderCell,
  columns,
  visibleColumns = "all",
  loadingState,
  emptyState = "No items found.",
  ariaLabel,
}) => {
  const classNames = useMemo(
    () => ({
      base: "gap-2 my-2",
      wrapper: ["p-2", "rounded-sm"],
      th: [
        "bg-transparent",
        "text-default-500",
        "border-b",
        "border-divider",
        "shadow-none",
      ],
      td: ["before:!rounded-none"],
      tr: ["!shadow-none"],
    }),
    []
  );
  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1 flex justify-between items-center">
        <Pagination
          showControls
          className="overflow-hidden"
          color="primary"
          page={currentPage}
          radius="sm"
          total={lastPage}
          variant="faded"
          onChange={(page) => setCurrentPage(page)}
        />
        <label
          className="flex items-center text-default-400 text-small gap-2"
          htmlFor="rows-per-page"
        >
          <span className="text-nowrap">Rows per page:</span>
          <Select
            className="w-20"
            classNames={{
              value: "!text-gray-400",
            }}
            id="rows-per-page"
            selectedKeys={[String(perPage)]}
            size="sm"
            value={perPage}
            variant="bordered"
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <SelectItem key="10">10</SelectItem>
            <SelectItem key="25">25</SelectItem>
            <SelectItem key="50">50</SelectItem>
            <SelectItem key="100">100</SelectItem>
          </Select>
        </label>
      </div>
    );
  }, [currentPage, lastPage, perPage]);

  const defaultLoadingState = (
    <div className="flex flex-col gap-4 pt-2">
      {Array.from({ length: perPage }).map((_, index) => (
        <Skeleton key={index} className="w-full h-4 rounded" />
      ))}
    </div>
  );

  return (
    <Table
      isHeaderSticky
      isStriped
      aria-label={ariaLabel}
      bottomContent={bottomContent}
      bottomContentPlacement="inside"
      classNames={classNames}
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={
          isLoading
            ? loadingState
              ? loadingState
              : defaultLoadingState
            : emptyState
        }
        items={items}
      >
        {(item) => (
          <TableRow key={item.id} className="rounded-sm">
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default CustomTable;
