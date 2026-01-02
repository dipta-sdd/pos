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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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

        <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Branch Name
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : branches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No branches found.
                    </td>
                  </tr>
                ) : (
                  branches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-gray-200">
                          {branch.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {branch.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {branch.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {branch.phone}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {branch.address ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {branch.address}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(branch)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-sm dark:text-blue-400 dark:hover:bg-blue-900/20"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(branch.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-sm dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && branches.length > 0 && (
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={(p) => fetchBranches(p)}
              perPage={perPage}
              onPerPageChange={setPerPage}
            />
          )}
        </div>

        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          size="2xl"
          className="bg-white dark:bg-gray-800"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {selectedBranch ? "Edit Branch" : "Create New Branch"}
                </ModalHeader>
                <ModalBody className="p-6">
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
