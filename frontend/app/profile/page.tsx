'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update
    try {
      // await authAPI.updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-8 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your account information</p>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <p className="mt-1 text-gray-900">{user.fullName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Account Type
                    </label>
                    <p className="mt-1 text-gray-900 capitalize">{user.role}</p>
                  </div>

                  {user.shopName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Shop Name
                      </label>
                      <p className="mt-1 text-gray-900">{user.shopName}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="border border-red-300 text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/orders"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="text-lg font-bold text-gray-900">📋 My Orders</h3>
              <p className="text-gray-600 mt-2">View your purchase history</p>
            </a>
            <a
              href="/profile/settings"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="text-lg font-bold text-gray-900">⚙️ Settings</h3>
              <p className="text-gray-600 mt-2">Manage account settings</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
