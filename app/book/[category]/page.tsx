'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, X, Search } from 'lucide-react';
import { useBookingCart } from '@/app/lib/BookingCart';
import StyleDetailModal from '@/app/components/StyleDetailModal';

interface PriceVariation {
    name: string;
    price: number;
}

interface HairStyle {
    _id: string;
    category: string;
    name: string;
    value: string;
    price: number;
    priceVariations?: PriceVariation[];
    variationLabel?: string;
    description: string;
    imageUrl: string;
    isTrending: boolean;
    duration: string;
    isActive: boolean;
    imagePosition?: 'top' | 'center' | 'bottom';
}

export default function CategoryStylesPage() {
    const [styles, setStyles] = useState<HairStyle[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [selectedStyleForModal, setSelectedStyleForModal] = useState<HairStyle | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const { setSelectedStyle } = useBookingCart();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (params.category) {
            const decodedCategory = decodeURIComponent(params.category as string).toUpperCase();
            setCategoryName(decodedCategory);
            fetchStyles(decodedCategory);
        }
    }, [params.category]);

    const fetchStyles = async (category: string) => {
        try {
            const response = await fetch('/api/hair-styles');
            if (response.ok) {
                const data = await response.json();
                const filtered = data.filter(
                    (style: HairStyle) => style.isActive && style.category.toUpperCase() === category
                );
                setStyles(filtered);
            }
        } catch (error) {
            console.error('Error fetching styles:', error);
        } finally {
            setLoading(false);
        }
    };

    // Open modal when a style is clicked
    const handleStyleClick = (style: HairStyle) => {
        setSelectedStyleForModal(style);
        setIsModalOpen(true);
    };

    // Handle selection from modal (with or without variation)
    const handleModalSelect = (style: HairStyle, selectedVariation: { name: string; price: number } | null) => {
        setSelectedStyle({
            _id: style._id,
            name: style.name,
            category: style.category,
            price: selectedVariation ? selectedVariation.price : style.price || 0,
            variationName: selectedVariation?.name,
            imageUrl: style.imageUrl,
        });
        setIsModalOpen(false);
        router.push('/book/addons');
    };

    const formatPrice = (price: number) => {
        return `GH₵${price.toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;
    };

    // Helper to get display price for cards (minimum of variations or single price)
    const getDisplayPrice = (style: HairStyle) => {
        if (style.priceVariations && style.priceVariations.length > 0) {
            return Math.min(...style.priceVariations.map(v => v.price));
        }
        return style.price || 0;
    };

    // Check if style has variations
    const hasVariations = (style: HairStyle): boolean => {
        return !!(style.priceVariations && style.priceVariations.length > 0);
    };

    // Filter styles by search query
    const filteredStyles = styles.filter(style => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            style.name.toLowerCase().includes(query) ||
            style.description?.toLowerCase().includes(query)
        );
    });

    const trendingStyles = filteredStyles.filter(s => s.isTrending);
    const regularStyles = filteredStyles.filter(s => !s.isTrending);

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
                <Link href="/book" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Categories
                </Link>
                <h1 className="text-3xl md:text-4xl font-['Noto_Serif_Display'] text-white mb-2">
                    {categoryName}
                </h1>
                <p className="text-gray-400">
                    Select a style to continue with your booking
                </p>
            </div>

            {/* Search Bar */}
            {styles.length > 3 && (
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search styles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-11 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-white/30 focus:outline-none"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="text-sm text-gray-500 mt-2">
                            {filteredStyles.length} of {styles.length} styles match
                        </p>
                    )}
                </div>
            )}

            {/* No Results */}
            {searchQuery && filteredStyles.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400">No styles match "{searchQuery}"</p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-white/70 hover:text-white underline text-sm"
                    >
                        Clear search
                    </button>
                </div>
            )}

            {/* Trending Section */}
            {trendingStyles.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">🔥</span>
                        <h2 className="text-xl font-['Noto_Serif_Display'] text-white">Trending</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trendingStyles.map((style, index) => (
                            <StyleCard
                                key={style._id}
                                style={style}
                                index={index}
                                onSelect={handleStyleClick}
                                formatPrice={formatPrice}
                                getDisplayPrice={getDisplayPrice}
                                hasVariations={hasVariations}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Regular Styles */}
            {regularStyles.length > 0 && (
                <div>
                    <h2 className="text-xl font-['Noto_Serif_Display'] text-white mb-4">All Styles</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {regularStyles.map((style, index) => (
                            <StyleCard
                                key={style._id}
                                style={style}
                                index={index}
                                onSelect={handleStyleClick}
                                formatPrice={formatPrice}
                                getDisplayPrice={getDisplayPrice}
                                hasVariations={hasVariations}
                            />
                        ))}
                    </div>
                </div>
            )}

            {styles.length === 0 && (
                <div className="text-center py-12">
                    <h3 className="text-xl text-gray-400">No styles available in this category</h3>
                    <Link href="/book" className="text-white mt-4 inline-block hover:underline">
                        Browse other categories
                    </Link>
                </div>
            )}

            {/* Style Detail Modal */}
            <StyleDetailModal
                style={selectedStyleForModal}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleModalSelect}
            />
        </div>
    );
}

function StyleCard({
    style,
    index,
    onSelect,
    formatPrice,
    getDisplayPrice,
    hasVariations,
}: {
    style: HairStyle;
    index: number;
    onSelect: (style: HairStyle) => void;
    formatPrice: (price: number) => string;
    getDisplayPrice: (style: HairStyle) => number;
    hasVariations: (style: HairStyle) => boolean;
}) {
    const displayPrice = getDisplayPrice(style);
    const showFromPrefix = hasVariations(style);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onSelect(style)}
            className="group cursor-pointer relative overflow-hidden rounded-xl aspect-[3/4] sm:aspect-[3/4] bg-gray-900"
        >
            {/* Full-bleed Image */}
            <Image
                src={style.imageUrl || 'https://res.cloudinary.com/dxq5zhfqw/image/upload/v1765829347/hairengineer/hairstyles/cresotpwclzvqh5moadw.jpg'}
                alt={style.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`object-contain object-${style.imagePosition || 'top'} group-hover:scale-105 transition-transform duration-500`}
            />

            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Trending badge */}
            {style.isTrending && (
                <span className="absolute top-2 right-2 bg-white text-black text-xs px-2 py-1 rounded-full font-medium">
                    🔥 Trending
                </span>
            )}

            {/* Style Info - overlaid on image */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-base font-medium text-white mb-1 group-hover:text-gray-200 transition line-clamp-2">
                    {style.name}
                </h3>

                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">
                        {showFromPrefix && <span className="text-sm font-normal text-gray-300">From </span>}
                        {formatPrice(displayPrice || 10)}
                    </span>
                    {style.duration && (
                        <span className="text-xs text-gray-300 flex items-center gap-1">
                            <Clock size={12} />
                            {style.duration}
                        </span>
                    )}
                </div>
            </div>

            {/* Hover border effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/40 rounded-xl transition-colors duration-300" />
        </motion.div>
    );
}
