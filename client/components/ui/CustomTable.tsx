"use client";
import { Pagination, Select, SelectItem } from "@heroui/react";
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
import { useCallback, useMemo } from "react";

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
}) => {
  const classNames = useMemo(
    () => ({
      base: "gap-2 my-2",
      wrapper: ["p-2", "dark:bg-slate-900", "rounded-sm"],
      th: [
        "bg-transparent",
        "text-default-500",
        "border-b",
        "border-divider",
        "shadow-none",
      ],
      td: [
        "before:!rounded-none",
        "dark:group-data-[odd=true]/tr:before:bg-slate-950",
      ],
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
          total={lastPage}
          variant="faded"
          radius="sm"
          onChange={(page) => setCurrentPage(page)}
        />
        <label className="flex items-center text-default-400 text-small gap-2">
          <span className="text-nowrap">Rows per page:</span>
          <Select
            size="sm"
            className="w-20"
            classNames={{
              value: "!text-gray-400",
            }}
            variant="bordered"
            selectedKeys={[String(perPage)]}
            value={perPage}
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

  return (
    <Table
      isStriped
      isHeaderSticky
      aria-label="Branches table with sorting"
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
        emptyContent={isLoading ? "Loading..." : "No items found."}
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
