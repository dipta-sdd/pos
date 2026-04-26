"use client";

import { Card, CardBody } from "@heroui/card";
import { Wallet, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserLoding } from "@/components/user-loding";
import api from "@/lib/api";

export default function FinancialLedgerPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendor?.id) {
      fetchReport();
    }
  }, [vendor?.id]);

  const fetchReport = async () => {
    try {
      const response: any = await api.get(`/reports/financial?vendor_id=${vendor?.id}`);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch report data", error);
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading || loading) return <UserLoding />;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const totalRevenue = data?.revenue_by_payment_method?.reduce((acc: number, curr: any) => acc + Number(curr.total), 0) || 0;
  const totalExpenses = data?.expenses_by_category?.reduce((acc: number, curr: any) => acc + Number(curr.total), 0) || 0;

  return (
    <PermissionGuard permission="can_view_reports">
      <div className="p-6">
        <PageHeader
          description="Track your income and expenses"
          title="Financial Ledger"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-success-50 border-success-100">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-success-700 font-medium">Total Revenue</p>
                <ArrowUpRight className="text-success-600 w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-success-900">${totalRevenue.toFixed(2)}</p>
            </CardBody>
          </Card>
          <Card className="bg-danger-50 border-danger-100">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-danger-700 font-medium">Total Expenses</p>
                <ArrowDownRight className="text-danger-600 w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-danger-900">${totalExpenses.toFixed(2)}</p>
            </CardBody>
          </Card>
          <Card className="bg-primary-50 border-primary-100">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-primary-700 font-medium">Net Profit</p>
                <Wallet className="text-primary-600 w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-primary-900">${(totalRevenue - totalExpenses).toFixed(2)}</p>
            </CardBody>
          </Card>
        </div>

        <Card className="mb-8">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-primary w-5 h-5" />
              <h3 className="text-lg font-bold">Net Profit Trend</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.daily_profit || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#006FEE" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#006FEE' }} 
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
                <PieChartIcon className="text-success w-5 h-5" />
                <h3 className="text-lg font-bold">Revenue by Payment Method</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.revenue_by_payment_method?.map((p: any) => ({
                        name: p.name,
                        value: Number(p.total)
                      })) || []}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(data?.revenue_by_payment_method || []).map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="text-danger w-5 h-5" />
                <h3 className="text-lg font-bold">Expenses by Category</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.expenses_by_category?.map((c: any) => ({
                        name: c.name,
                        value: Number(c.total)
                      })) || []}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(data?.expenses_by_category || []).map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
