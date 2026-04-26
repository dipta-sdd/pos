"use client";

import { Card, CardBody } from "@heroui/card";
import { LineChart as LineChartIcon, Download, Filter, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@heroui/button";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserLoding } from "@/components/user-loding";
import api from "@/lib/api";

export default function SalesReportPage() {
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
      const response: any = await api.get(`/reports/sales`, {
        params: {
          vendor_id: vendor?.id,
          branch_ids: selectedBranchIds.length > 0 ? selectedBranchIds : undefined,
        }
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

  return (
    <PermissionGuard permission="can_view_reports">
      <div className="p-6">
        <PageHeader
          description="Analyze your sales performance and trends"
          title="Sales Reports"
        >
          <div className="flex gap-2">
            <Button
              startContent={<Filter className="w-4 h-4" />}
              variant="flat"
            >
              Filter
            </Button>
            <Button
              startContent={<Download className="w-4 h-4" />}
              variant="flat"
            >
              Export
            </Button>
          </div>
        </PageHeader>

        <Card className="mb-8 overflow-hidden">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <LineChartIcon className="text-primary w-5 h-5" />
              <h3 className="text-lg font-bold">Daily Sales Revenue</h3>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.sales_over_time || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#006FEE" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#006FEE' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="text-secondary w-5 h-5" />
                <h3 className="text-lg font-bold">Top Products by Revenue</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.top_products?.map((p: any) => ({
                    name: p.variant?.product?.name || 'Unknown',
                    revenue: Number(p.total_revenue)
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="revenue" fill="#9353D3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="text-warning w-5 h-5" />
                <h3 className="text-lg font-bold">Sales by Category</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.sales_by_category?.map((c: any) => ({
                        name: c.category_name,
                        value: Number(c.total)
                      })) || []}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(data?.sales_by_category || []).map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                   {data?.sales_by_category?.map((c: any, index: number) => (
                     <div key={c.category_name} className="flex items-center gap-1.5">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                       <span className="text-xs font-medium">{c.category_name}</span>
                     </div>
                   ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
