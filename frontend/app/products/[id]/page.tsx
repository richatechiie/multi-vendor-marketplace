'use client';

import { useEffect, useState } from 'react';
import { productsAPI, reviewsAPI } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  vendor: string;
  vendorId: string;
  specifications?: Record<string, string>;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  createdAt: string;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, reviewsRes] = await Promise.all([
          productsAPI.getById(params.id),
          reviewsAPI.getByProduct(params.id),
        ]);

        setProduct(productRes.data.data);
        setReviews(reviewsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        // Mock data
        setProduct({
          id: params.id,
          name: 'Premium Wireless Headphones',
          price: 79.99,
          description:
            'Experience crystal-clear audio with our premium wireless headphones. Perfect for music, calls, and gaming.',
          image: '/placeholder.png',
          rating: 4.5,
          reviews: 128,
          stock: 15,
          vendor: 'TechStore',
          vendorId: 'v1',
          specifications: {
            'Driver Size': '40mm',
            'Battery Life': '30 hours',
            'Connection': 'Bluetooth 5.0',
            'Weight': '250g',
          },
        });
        setReviews([
          {
            id: '1',
            rating: 5,
            comment: 'Excellent quality and great sound!',
            author: 'John Doe',
            createdAt: '2024-01-15',
          },
          {
            id: '2',
            rating: 4,
            comment: 'Good product, battery could be better',
            author: 'Jane Smith',
            createdAt: '2024-01-10',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `${product.id}-${i}`,
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        vendorId: product.vendorId,
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle review submission
    try {
      await reviewsAPI.create(product.id, {
        rating: userRating,
        comment: userComment,
      });
      setUserRating(0);
      setUserComment('');
      // Refresh reviews
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            {product.image ? (
              <div className="relative w-full h-96">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-200 text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Vendor */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-gray-600">
                Sold by{' '}
                <Link href={`/vendor/${product.vendorId}`} className="text-blue-600 hover:underline font-medium">
                  {product.vendor}
                </Link>
              </p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <p className="text-green-600 font-medium">In Stock ({product.stock} available)</p>
              ) : (
                <p className="text-red-600 font-medium">Out of Stock</p>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 border-l border-r border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">{key}</span>
                      <span className="text-gray-900 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

          {/* Write Review Form */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="text-2xl"
                    >
                      {star <= userRating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Share your experience with this product..."
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{review.author}</p>
                    <p className="text-sm text-gray-500">{review.createdAt}</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">
                        {i < review.rating ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
