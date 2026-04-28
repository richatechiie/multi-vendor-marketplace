'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCartStore } from '@/lib/store';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  vendor?: string;
  vendorId?: string;
  stock?: number;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  rating,
  reviews,
  vendor,
  vendorId,
  stock = 0,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: `${id}-${Date.now()}`,
      productId: id,
      productName: name,
      price,
      quantity: 1,
      image,
      vendorId: vendorId || '',
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <Link href={`/products/${id}`}>
        <div className="relative h-48 bg-gray-100 overflow-hidden cursor-pointer">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              No Image
            </div>
          )}
          {stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 cursor-pointer">
            {name}
          </h3>
        </Link>

        {/* Vendor */}
        {vendor && (
          <p className="text-sm text-gray-500 mt-1">
            by{' '}
            <Link href={`/vendor/${vendorId}`} className="text-blue-600 hover:underline">
              {vendor}
            </Link>
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-600">({reviews})</span>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">${price.toFixed(2)}</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={stock === 0}
          className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors ${
            stock === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isAdded
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isAdded ? '✓ Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
