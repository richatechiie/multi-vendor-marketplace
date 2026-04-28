'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ordersAPI } from '@/lib/api';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getAll();
        setOrders(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        // Mock data
        setOrders([
          {
            id: '1',
            orderNumber: 'ORD-2024-001',
            totalAmount: 299.99,
            status: 'Delivered',
            createdAt: '2024-01-20',
            items: [
              {
                productName: 'Wireless Headphones',
                quantity: 1,
                price: 79.99,
              },
              {
                productName: 'Phone Case',
                quantity: 2,
                price: 19.99,
              },
            ],
          },
          {
            id: '2',
            orderNumber: 'ORD-2024-002',
            totalAmount: 59.99,
            status: 'Shipped',
            createdAt: '2024-01-19',
            items: [
              {
                productName: 'USB-C Cable',
                quantity: 3,
                price: 12.99,
              },
            ],
          },
          {
            id: '3',
            orderNumber: 'ORD-2024-003',
            totalAmount: 129.98,
            status: 'Processing',
            createdAt: '2024-01-18',
            items: [
              {
                productName: 'Screen Protector',
                quantity: 4,
                price: 9.99,
              },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
            <p className="text-gray-600 text-lg mb-8">You haven&apos;t placed any orders yet</p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order {order.orderNumber}</p>
                  <p className="text-lg font-semibold text-gray-900">{order.createdAt}</p>
                </div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'Delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'Shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-600">
                      <span>
                        {item.quantity}x {item.productName}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-900">
                  Total: ${order.totalAmount.toFixed(2)}
                </p>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
