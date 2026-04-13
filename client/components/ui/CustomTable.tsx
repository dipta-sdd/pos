"use client";
import { Link, Pagination, Select, SelectItem, Skeleton } from "@heroui/react";
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
import { Calendar, User } from "lucide-react";
import { useMemo } from "react";

import { formatDateTime } from "@/lib/helper/dates";

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
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: "all" | Selection;
  onSelectionChange?: (keys: "all" | Selection) => void;
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
  selectionMode = "none",
  selectedKeys,
  onSelectionChange,
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
    [],
  );
  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-1 flex flex-col md:flex-row gap-2 justify-between items-center">
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
      selectedKeys={selectedKeys}
      selectionMode={selectionMode}
      sortDescriptor={sortDescriptor}
      onSelectionChange={onSelectionChange}
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

export const loggerColumns = (key: string, item: any) => {
  switch (key) {
    case "created_at":
      return item?.created_at ? (
        <div className="flex items-center gap-2 text-small">
          <Calendar className="w-4 min-w-4 h-4 text-default-400" />
          {formatDateTime(item.created_at)}
        </div>
      ) : (
        <span className="text-default-500">-</span>
      );
    case "updated_at":
      return item?.updated_at ? (
        <div className="flex items-center gap-2 text-small">
          <Calendar className="w-4 min-w-4 h-4 text-default-400" />
          {formatDateTime(item.updated_at)}
        </div>
      ) : (
        <span className="text-default-500">-</span>
      );
    case "created_by":
      // item has created_by_name and also created_by , key is created_by for indexing and sorting
      return item?.created_by_name ? (
        <Link href={`/pos/users/${item.created_by}`} size="sm">
          <span className="flex items-center gap-2 text-small">
            <User className="w-4.5 min-w-4.5 h-4.5 border border-primary rounded-full pt-0.5" />
            {item.created_by_name}
          </span>
        </Link>
      ) : (
        <span className="text-default-500">-</span>
      );
    case "updated_by":
      // item has updated_by_name and also updated_by , key is updated_by for indexing and sorting
      return item?.updated_by_name ? (
        <Link href={`/pos/users/${item.updated_by}`} size="sm">
          <span className="flex items-center gap-2 text-small">
            <User className="w-4.5 min-w-4.5 h-4.5 border border-primary rounded-full pt-0.5" />
            {item.updated_by_name}
          </span>
        </Link>
      ) : (
        <span className="text-default-500">-</span>
      );
  }
};

export const LOGGER_COLUMNS = [
  { uid: "created_at", name: "CREATED AT", sortable: true },
  { uid: "created_by", name: "CREATED BY", sortable: true },
  { uid: "updated_at", name: "UPDATED AT", sortable: true },
  { uid: "updated_by", name: "UPDATED BY", sortable: true },
];
