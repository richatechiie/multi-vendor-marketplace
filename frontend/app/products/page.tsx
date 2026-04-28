'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { productsAPI } from '@/lib/api';

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

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('latest');

  const category = searchParams.get('category');
  const query = searchParams.get('q');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const filters = {
          category: category || undefined,
          search: query || undefined,
        };
        const response = await productsAPI.getAll(filters);
        setProducts(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Mock data
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
          {
            id: '5',
            name: 'Laptop Stand',
            price: 34.99,
            image: '/placeholder.png',
            rating: 4.7,
            reviews: 67,
            vendor: 'OfficeGear',
            vendorId: 'v4',
            stock: 25,
          },
          {
            id: '6',
            name: 'Keyboard',
            price: 59.99,
            image: '/placeholder.png',
            rating: 4.4,
            reviews: 98,
            vendor: 'TechStore',
            vendorId: 'v1',
            stock: 40,
          },
          {
            id: '7',
            name: 'Mouse',
            price: 29.99,
            image: '/placeholder.png',
            rating: 4.6,
            reviews: 156,
            vendor: 'AccessoriesHub',
            vendorId: 'v2',
            stock: 75,
          },
          {
            id: '8',
            name: 'Monitor Stand',
            price: 44.99,
            image: '/placeholder.png',
            rating: 4.2,
            reviews: 45,
            vendor: 'OfficeGear',
            vendorId: 'v4',
            stock: 20,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, query]);

  useEffect(() => {
    let filtered = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(filtered);
  }, [products, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 hidden lg:block">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-600">
                    Min: ${priceRange[0]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([parseInt(e.target.value), priceRange[1]])
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Max: ${priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-4 mt-8">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="latest">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                {category && `${category}`}
                {query && `Search Results for "${query}"`}
                {!category && !query && 'All Products'}
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} products found
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
