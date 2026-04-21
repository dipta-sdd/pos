import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import { formatDate } from "@/lib/helper/dates";

interface StockBatch {
  id: number;
  branch_id: number;
  branch?: { name: string };
  quantity: number;
  cost_price: number;
  selling_price: number;
  expiry_date: string | null;
}

interface ViewStockModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  variantId: number;
  selectedBranchIds: string[];
  onSuccess: () => void;
  isDecimalAllowed?: boolean | number;
}

export default function ViewStockModal({
  isOpen,
  onOpenChange,
  variantId,
  selectedBranchIds,
  onSuccess,
  isDecimalAllowed,
}: ViewStockModalProps) {
  const [stocks, setStocks] = useState<StockBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<StockBatch>>({});

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/branch-products/stocks`, {
        params: {
          variant_id: variantId,
          branch_ids:
            selectedBranchIds.length > 0 ? selectedBranchIds : undefined,
        },
      });

      setStocks(response.data as StockBatch[]);
    } catch (error) {
      console.error("Failed to fetch stocks", error);
      toast.error("Failed to load stock batches");
    } finally {
      setLoading(false);
    }
  }, [variantId, selectedBranchIds]);

  useEffect(() => {
    if (isOpen) {
      fetchStocks();
      setEditingId(null);
    }
  }, [isOpen, fetchStocks]);

  const handleEdit = (stock: StockBatch) => {
    setEditingId(stock.id);
    setEditForm({ ...stock });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: number) => {
    try {
      await api.put(`/branch-products/stocks/${id}`, editForm);
      toast.success("Stock batch updated");
      setEditingId(null);
      fetchStocks();
      onSuccess();
    } catch (error) {
      toast.error("Failed to update stock batch");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this stock batch?")) return;
    try {
      await api.delete(`/branch-products/stocks/${id}`);
      toast.success("Stock batch deleted");
      fetchStocks();
      onSuccess();
    } catch (error) {
      toast.error("Failed to delete stock batch");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="4xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Stock Batches
            </ModalHeader>
            <ModalBody>
              <Table removeWrapper aria-label="Stock batches table">
                <TableHeader>
                  <TableColumn>BRANCH</TableColumn>
                  <TableColumn>QUANTITY</TableColumn>
                  <TableColumn>COST PRICE</TableColumn>
                  <TableColumn>SELLING PRICE</TableColumn>
                  <TableColumn>EXPIRY</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent={"No stock batches found for selected branches."}
                  isLoading={loading}
                  loadingContent={"Loading stocks..."}
                >
                  {stocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell>{stock.branch?.name || "Unknown"}</TableCell>
                      <TableCell>
                        {editingId === stock.id ? (
                          <Input
                            size="sm"
                            step={isDecimalAllowed ? "0.01" : "1"}
                            type="number"
                            value={String(editForm.quantity)}
                            onValueChange={(val) =>
                              setEditForm((prev) => ({
                                ...prev,
                                quantity: Number(val),
                              }))
                            }
                          />
                        ) : (
                          <div className="flex flex-col">
                            <span>{isDecimalAllowed ? Number(stock.quantity).toFixed(2) : Math.round(stock.quantity)}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === stock.id ? (
                          <Input
                            size="sm"
                            type="number"
                            value={String(editForm.cost_price)}
                            onValueChange={(val) =>
                              setEditForm((prev) => ({
                                ...prev,
                                cost_price: Number(val),
                              }))
                            }
                          />
                        ) : (
                          stock.cost_price
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === stock.id ? (
                          <Input
                            size="sm"
                            type="number"
                            value={String(editForm.selling_price)}
                            onValueChange={(val) =>
                              setEditForm((prev) => ({
                                ...prev,
                                selling_price: Number(val),
                              }))
                            }
                          />
                        ) : (
                          stock.selling_price
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === stock.id ? (
                          <Input
                            size="sm"
                            type="date"
                            value={editForm.expiry_date || ""}
                            onValueChange={(val) =>
                              setEditForm((prev) => ({
                                ...prev,
                                expiry_date: val,
                              }))
                            }
                          />
                        ) : (
                          formatDate(stock.expiry_date)
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {editingId === stock.id ? (
                            <>
                              <Button
                                isIconOnly
                                color="success"
                                size="sm"
                                variant="flat"
                                onPress={() => handleSave(stock.id)}
                              >
                                <Check size={16} />
                              </Button>
                              <Button
                                isIconOnly
                                color="danger"
                                size="sm"
                                variant="flat"
                                onPress={cancelEdit}
                              >
                                <X size={16} />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                onPress={() => handleEdit(stock)}
                              >
                                <Edit2 size={16} />
                              </Button>
                              <Button
                                isIconOnly
                                color="danger"
                                size="sm"
                                variant="flat"
                                onPress={() => handleDelete(stock.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Done
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
