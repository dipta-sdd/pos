"use client";

import PermissionGuard from "@/components/auth/PermissionGuard";
import { useVendor } from "@/lib/contexts/VendorContext";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Pagination from "@/components/ui/Pagination";
import { Edit, Trash2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@heroui/input";
import { SearchIcon } from "@/components/icons";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/modal";
import BranchForm from "./_components/BranchForm";

interface Branch {
  id: number;
  name: string;
  description?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export default function BranchesPage() {
  const { vendor, currentRole, isLoading: contextLoading } = useVendor();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    if (vendor?.id) {
      const delayDebounceFn = setTimeout(() => {
        fetchBranches(1);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [vendor?.id, perPage, search]);

  const fetchBranches = async (page: number) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/branches?page=${page}&per_page=${perPage}&vendor_id=${vendor?.id}&search=${search}`
      );
      // @ts-ignore
      setBranches(response?.data?.data);
      // @ts-ignore
      setCurrentPage(response?.data?.current_page);
      // @ts-ignore
      setLastPage(response?.data?.last_page);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (branchId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this branch? This action cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/branches/${branchId}`);
      toast.success("Branch deleted successfully");
      fetchBranches(currentPage);
    } catch (error: any) {
      console.error("Failed to delete branch:", error);
      toast.error(error.response?.data?.message || "Failed to delete branch");
    }
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedBranch(null);
    onOpen();
  };

  const handleModalClose = () => {
    onOpenChange();
    setSelectedBranch(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    fetchBranches(currentPage);
  };

  const canManage = currentRole?.can_manage_branches_and_counters;

  if (contextLoading) return <div>Loading...</div>;

  return (
    <PermissionGuard permission="can_manage_branches_and_counters">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Branches
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your shop locations
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Branch
          </button>
        </div>

        <div className="mb-6 w-full md:w-1/3">
          <Input
            aria-label="Search branches"
            placeholder="Search branches..."
            startContent={
              <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
            }
            value={search}
            onValueChange={setSearch}
            isClearable
            onClear={() => setSearch("")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
              ></div>
            ))
          ) : branches.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              No branches found.
            </div>
          ) : (
            branches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {branch.name}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/20"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {branch.description && <p>{branch.description}</p>}
                  {branch.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  {branch.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{branch.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && branches.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={(p) => fetchBranches(p)}
              perPage={perPage}
              onPerPageChange={setPerPage}
            />
          </div>
        )}

        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" className="bg-white dark:bg-gray-800">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {selectedBranch ? "Edit Branch" : "Create New Branch"}
                </ModalHeader>
                <ModalBody>
                  <BranchForm
                    initialData={selectedBranch}
                    isEditing={!!selectedBranch}
                    onSuccess={handleSuccess}
                    onCancel={onClose}
                  />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
