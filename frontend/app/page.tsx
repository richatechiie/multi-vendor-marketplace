'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { productsAPI } from '@/lib/api';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  vendor: string;
  vendorId: string;
  stock: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        setProducts(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products');
        // Mock data for demonstration
        setProducts([
          {
            id: '1',
            name: 'Wireless Headphones',
            price: 79.99,
            image: '/placeholder.png',
            rating: 4.5,
            reviews: 128,
            vendor: 'TechStore',
            vendorId: 'v1',
            stock: 15,
          },
          {
            id: '2',
            name: 'USB-C Cable',
            price: 12.99,
            image: '/placeholder.png',
            rating: 4.8,
            reviews: 256,
            vendor: 'AccessoriesHub',
            vendorId: 'v2',
            stock: 50,
          },
          {
            id: '3',
            name: 'Phone Case',
            price: 19.99,
            image: '/placeholder.png',
            rating: 4.3,
            reviews: 89,
            vendor: 'ProtectGear',
            vendorId: 'v3',
            stock: 30,
          },
          {
            id: '4',
            name: 'Screen Protector',
            price: 9.99,
            image: '/placeholder.png',
            rating: 4.6,
            reviews: 145,
            vendor: 'ProtectGear',
            vendorId: 'v3',
            stock: 100,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to MarketHub
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Discover amazing products from trusted vendors worldwide
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/products"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Shop Now
              </Link>
              <Link
                href="/vendor/signup"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Electronics', 'Fashion', 'Home & Garden', 'Sports'].map((category) => (
            <Link
              key={category}
              href={`/products?category=${category.toLowerCase()}`}
              className="bg-gray-100 p-6 rounded-lg text-center hover:bg-blue-50 transition cursor-pointer"
            >
              <div className="text-4xl mb-2">📦</div>
              <h3 className="font-semibold text-gray-900">{category}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        {products.length > 8 && (
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View All Products
            </Link>
          </div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Choose MarketHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: '✓',
                title: 'Trusted Vendors',
                description: 'Buy from verified and rated sellers',
              },
              {
                icon: '🚚',
                title: 'Fast Shipping',
                description: 'Quick delivery to your doorstep',
              },
              {
                icon: '🛡️',
                title: 'Secure Payment',
                description: 'Safe and encrypted transactions',
              },
              {
                icon: '↩️',
                title: 'Easy Returns',
                description: 'Hassle-free return policy',
              },
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
