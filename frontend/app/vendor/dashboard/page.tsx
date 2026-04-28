'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { vendorsAPI, ordersAPI, productsAPI } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  recentOrders: any[];
}

export default function VendorDashboard() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      router.push('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await vendorsAPI.getDashboard();
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
        // Mock data
        setDashboardData({
          totalSales: 15000,
          totalOrders: 42,
          totalProducts: 18,
          averageRating: 4.6,
          recentOrders: [
            {
              id: 'ORD001',
              customerName: 'John Doe',
              amount: 599.99,
              status: 'Delivered',
              date: '2024-01-20',
            },
            {
              id: 'ORD002',
              customerName: 'Jane Smith',
              amount: 299.99,
              status: 'Processing',
              date: '2024-01-19',
            },
            {
              id: 'ORD003',
              customerName: 'Bob Johnson',
              amount: 799.99,
              status: 'Shipped',
              date: '2024-01-18',
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {user?.shopName}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Sales</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${dashboardData.totalSales.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">
              {dashboardData.totalOrders}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Products Listed</h3>
            <p className="text-3xl font-bold text-gray-900">
              {dashboardData.totalProducts}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Average Rating</h3>
            <p className="text-3xl font-bold text-gray-900">
              {dashboardData.averageRating}⭐
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/vendor/products"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">📦 Manage Products</h3>
            <p className="text-gray-600">Add, edit, or remove your products</p>
          </Link>
          <Link
            href="/vendor/orders"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">📋 Manage Orders</h3>
            <p className="text-gray-600">View and process customer orders</p>
          </Link>
          <Link
            href="/vendor/settings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">⚙️ Shop Settings</h3>
            <p className="text-gray-600">Update your shop information</p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/vendor/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
