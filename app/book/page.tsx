'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface ServiceCategory {
    _id: string;
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    order: number;
    imagePosition?: 'top' | 'center' | 'bottom';
}

export default function BookPage() {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/service-categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data.filter((cat: ServiceCategory) => cat.isActive));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full px-4 py-8 bg-black">
            {/* Header */}
            <div className="mb-8">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Home
                </Link>
                <h1 className="text-3xl md:text-4xl font-['Noto_Serif_Display'] text-white mb-2">
                    Choose a Category
                </h1>
                <p className="text-gray-400">
                    Select a hairstyle category to explore our styles
                </p>
            </div>

            {/* Categories - Single column full width on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                    <motion.div
                        key={category._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            href={`/book/${encodeURIComponent(category.name.toLowerCase())}`}
                            className="group block relative overflow-hidden rounded-xl aspect-[3/4] sm:aspect-[3/4] bg-gray-900"
                        >
                            {/* Full-bleed Image */}
                            <Image
                                src={category.imageUrl || 'https://res.cloudinary.com/dxq5zhfqw/image/upload/v1765829347/hairengineer/hairstyles/cresotpwclzvqh5moadw.jpg'}
                                alt={category.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className={`object-contain object-${category.imagePosition || 'top'} group-hover:scale-105 transition-transform duration-500`}
                            />

                            {/* Gradient overlay for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            {/* Category Name - overlaid on image */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h2 className="text-lg font-['Noto_Serif_Display'] text-white group-hover:text-gray-200 transition">
                                    {category.name}
                                </h2>
                                {category.description && (
                                    <p className="text-xs text-gray-300 line-clamp-1 mt-1">
                                        {category.description}
                                    </p>
                                )}
                            </div>

                            {/* Hover border effect */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-xl transition-colors duration-300" />
                        </Link>
                    </motion.div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-12">
                    <h3 className="text-xl text-gray-400">No categories available</h3>
                    <p className="text-gray-500 mt-2">Please check back later</p>
                </div>
            )}
        </div>
    );
}
