"use client";

import { Card, CardBody } from "@heroui/card";
import {
  Boxes,
  AlertTriangle,
  PieChart as PieChartIcon,
  TrendingDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserLoding } from "@/components/user-loding";
import api from "@/lib/api";

export default function InventoryReportsPage() {
  const { vendor, isLoading: contextLoading, selectedBranchIds } = useVendor();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendor?.id) {
      fetchReport();
    }
  }, [vendor?.id, selectedBranchIds]);

  const fetchReport = async () => {
    try {
      const response: any = await api.get(`/reports/inventory`, {
        params: {
          vendor_id: vendor?.id,
          branch_ids:
            selectedBranchIds.length > 0 ? selectedBranchIds : undefined,
        },
      });

      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch report data", error);
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading || loading) return <UserLoding />;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const totalValue =
    data?.stock_value_by_category?.reduce(
      (acc: number, curr: any) => acc + Number(curr.total_value),
      0,
    ) || 0;

  return (
    <PermissionGuard permission="can_view_reports">
      <div className="p-6">
        <PageHeader
          description="Monitor stock levels and inventory valuation"
          title="Inventory Reports"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-primary-50 border-primary-100">
            <CardBody className="p-6 flex flex-row items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
                <Boxes className="w-8 h-8" />
              </div>
              <div>
                <p className="text-primary-700 font-medium">
                  Total Inventory Value
                </p>
                <p className="text-3xl font-bold text-primary-900">
                  ${totalValue.toFixed(2)}
                </p>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-warning-50 border-warning-100">
            <CardBody className="p-6 flex flex-row items-center gap-4">
              <div className="p-3 bg-warning-100 rounded-xl text-warning-600">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-warning-700 font-medium">Low Stock Alerts</p>
                <p className="text-3xl font-bold text-warning-900">
                  {data?.low_stock_items?.length || 0} Items
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="text-primary w-5 h-5" />
                <h3 className="text-lg font-bold">Value by Category</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      data={
                        data?.stock_value_by_category?.map((c: any) => ({
                          name: c.category_name,
                          value: Number(c.total_value),
                        })) || []
                      }
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {(data?.stock_value_by_category || []).map(
                        (_entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingDown className="text-warning w-5 h-5" />
                <h3 className="text-lg font-bold">Low Stock Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3 text-right">Current Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.low_stock_items?.map((item: any) => (
                      <tr
                        key={item.id}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">
                          {item.variant?.product?.name} - {item.variant?.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {item.branch?.name}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full font-bold text-xs">
                            {item.quantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!data?.low_stock_items?.length && (
                      <tr>
                        <td
                          className="px-4 py-8 text-center text-gray-500"
                          colSpan={3}
                        >
                          All items are well stocked.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
