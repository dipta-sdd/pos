"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Divider,
} from "@heroui/react";
import { toast } from "sonner";
import { LogOut, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { BillingCounter, CashRegisterSession } from "@/lib/types/general";

interface RegisterStatusModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  activeSession: CashRegisterSession | null;
  onSessionChange: () => void;
}

export default function RegisterStatusModal({
  isOpen,
  onOpenChange,
  activeSession,
  onSessionChange,
}: RegisterStatusModalProps) {
  const { vendor, membership } = useVendor();
  const [counters, setCounters] = useState<BillingCounter[]>([]);
  const [loading, setLoading] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("0");
  const [selectedCounterId, setSelectedCounterId] = useState<string>("");
  const [closingBalance, setClosingBalance] = useState("0");
  const [mode, setMode] = useState<"summary" | "close" | "transaction">(
    "summary",
  );
  const [transactionType, setTransactionType] = useState<
    "cash_in" | "cash_out"
  >("cash_in");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionNotes, setTransactionNotes] = useState("");

  useEffect(() => {
    if (isOpen && !activeSession && vendor?.id) {
      fetchCounters();
    }
    if (isOpen && activeSession) {
      setMode("summary");
    }
  }, [isOpen, activeSession, vendor?.id]);

  const fetchCounters = async () => {
    try {
      const response: any = await api.get(
        `/billing-counters?vendor_id=${vendor?.id}&per_page=100`,
      );

      setCounters(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch counters", error);
    }
  };

  const handleOpenRegister = async () => {
    if (!selectedCounterId) {
      toast.error("Please select a billing counter");

      return;
    }
    setLoading(true);
    try {
      await api.post("/cash-register-sessions/open", {
        billing_counter_id: Number(selectedCounterId),
        opening_balance: Number(openingBalance),
      });
      toast.success("Register opened successfully");
      onSessionChange();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to open register");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRegister = async () => {
    setLoading(true);
    try {
      await api.post(`/cash-register-sessions/${activeSession?.id}/close`, {
        closing_balance: Number(closingBalance),
      });
      toast.success("Register closed successfully");
      onSessionChange();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to close register");
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    if (!transactionAmount || Number(transactionAmount) <= 0) {
      toast.error("Please enter a valid amount");

      return;
    }
    setLoading(true);
    try {
      // Find a default payment method for cash (usually the first one or we fetch them)
      // For now, let's assume we need to fetch them or user selects one.
      // To keep it simple, I'll fetch payment methods.
      const pmResponse: any = await api.get(
        `/payment-methods?vendor_id=${vendor?.id}`,
      );
      const cashMethod = pmResponse.data.data.find((pm: any) =>
        pm.name.toLowerCase().includes("cash"),
      );

      if (!cashMethod) {
        toast.error(
          "No 'Cash' payment method found. Please configure one in settings.",
        );

        return;
      }

      await api.post("/cash-transactions", {
        amount: Number(transactionAmount),
        type: transactionType,
        notes: transactionNotes,
        payment_method_id: cashMethod.id,
      });
      toast.success("Transaction recorded successfully");
      setMode("summary");
      setTransactionAmount("");
      setTransactionNotes("");
      onSessionChange();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to record transaction",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {activeSession ? "Register Management" : "Open Register"}
            </ModalHeader>
            <ModalBody>
              {!activeSession ? (
                <div className="space-y-4 py-2">
                  <Select
                    isRequired
                    label="Billing Counter"
                    placeholder="Select which counter you are using"
                    selectedKeys={selectedCounterId ? [selectedCounterId] : []}
                    variant="bordered"
                    onChange={(e) => setSelectedCounterId(e.target.value)}
                  >
                    {counters.map((c) => (
                      <SelectItem key={c.id} textValue={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Opening Cash Balance"
                    placeholder="0.00"
                    type="number"
                    value={openingBalance}
                    variant="bordered"
                    onValueChange={setOpeningBalance}
                  />
                  <p className="text-xs text-default-500">
                    This is the amount of cash currently in the drawer.
                  </p>
                </div>
              ) : mode === "summary" ? (
                <div className="space-y-6 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-default-100 rounded-lg">
                      <p className="text-xs text-default-500 uppercase font-bold">
                        Register
                      </p>
                      <p className="text-lg font-bold">
                        {activeSession.billing_counter?.name || "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-default-100 rounded-lg">
                      <p className="text-xs text-default-500 uppercase font-bold">
                        Opened By
                      </p>
                      <p className="text-lg font-bold">
                        {activeSession.user?.name || "Me"}
                      </p>
                    </div>
                  </div>

                  <Divider />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-default-500 font-medium">
                        Opening Balance
                      </p>
                      <p className="font-bold font-mono">
                        {Number(activeSession.opening_balance).toFixed(2)}
                      </p>
                    </div>
                    {/* These values would ideally be fetched from the session summary API */}
                    {/* For now we show the session we have */}
                    <div className="flex justify-between items-center text-success">
                      <p className="font-medium">Total Sales (Cash)</p>
                      <p className="font-bold font-mono">
                        + {Number(0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-success">
                      <p className="font-medium">Total Cash In</p>
                      <p className="font-bold font-mono">
                        + {Number(0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-danger">
                      <p className="font-medium">Total Cash Out</p>
                      <p className="font-bold font-mono">
                        - {Number(0).toFixed(2)}
                      </p>
                    </div>
                    <Divider />
                    <div className="flex justify-between items-center text-lg">
                      <p className="font-bold">Expected Cash</p>
                      <p className="font-bold font-mono">
                        {Number(activeSession.opening_balance).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button
                      color="primary"
                      startContent={<ArrowUpCircle className="w-4 h-4" />}
                      variant="flat"
                      onPress={() => {
                        setMode("transaction");
                        setTransactionType("cash_in");
                      }}
                    >
                      Cash In
                    </Button>
                    <Button
                      color="danger"
                      startContent={<ArrowDownCircle className="w-4 h-4" />}
                      variant="flat"
                      onPress={() => {
                        setMode("transaction");
                        setTransactionType("cash_out");
                      }}
                    >
                      Cash Out
                    </Button>
                  </div>
                </div>
              ) : mode === "transaction" ? (
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => setMode("summary")}
                    >
                      ← Back
                    </Button>
                    <h3 className="font-bold">
                      {transactionType === "cash_in"
                        ? "Add Cash (In)"
                        : "Remove Cash (Out)"}
                    </h3>
                  </div>
                  <Input
                    isRequired
                    label="Amount"
                    placeholder="0.00"
                    type="number"
                    value={transactionAmount}
                    variant="bordered"
                    onValueChange={setTransactionAmount}
                  />
                  <Input
                    label="Reason / Notes"
                    placeholder="e.g. Petty cash for supplies"
                    value={transactionNotes}
                    variant="bordered"
                    onValueChange={setTransactionNotes}
                  />
                  <Button
                    className="w-full"
                    color={transactionType === "cash_in" ? "primary" : "danger"}
                    isLoading={loading}
                    onPress={handleTransaction}
                  >
                    Confirm Transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => setMode("summary")}
                    >
                      ← Back
                    </Button>
                    <h3 className="font-bold text-danger">Close Register</h3>
                  </div>
                  <p className="text-sm text-default-500">
                    Please count all the cash in your drawer and enter the total
                    amount below.
                  </p>
                  <Input
                    isRequired
                    label="Actual Cash in Drawer"
                    placeholder="0.00"
                    type="number"
                    value={closingBalance}
                    variant="bordered"
                    onValueChange={setClosingBalance}
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {!activeSession ? (
                <Button
                  className="w-full"
                  color="primary"
                  isLoading={loading}
                  onPress={handleOpenRegister}
                >
                  Open Register
                </Button>
              ) : mode === "summary" ? (
                <Button
                  className="w-full"
                  color="danger"
                  startContent={<LogOut className="w-4 h-4" />}
                  variant="flat"
                  onPress={() => setMode("close")}
                >
                  End Session & Close Register
                </Button>
              ) : mode === "close" ? (
                <Button
                  className="w-full"
                  color="danger"
                  isLoading={loading}
                  onPress={handleCloseRegister}
                >
                  Verify & Close Register
                </Button>
              ) : null}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
