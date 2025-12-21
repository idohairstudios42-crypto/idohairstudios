'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBookingCart } from '@/app/lib/BookingCart';

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
    imagePosition?: 'top' | 'center' | 'bottom';
    isActive: boolean;
}

export default function TrendingStyles() {
    const [styles, setStyles] = useState<HairStyle[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { setSelectedStyle } = useBookingCart();

    useEffect(() => {
        fetchTrendingStyles();
    }, []);

    const fetchTrendingStyles = async () => {
        try {
            const response = await fetch('/api/hair-styles?trending=true');
            if (response.ok) {
                const data = await response.json();
                setStyles(data);
            }
        } catch (error) {
            console.error('Error fetching trending styles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStyleClick = (style: HairStyle) => {
        // If style has variations, redirect to category page where StyleDetailModal will open
        if (hasVariations(style)) {
            router.push(`/book/${encodeURIComponent(style.category)}`);
            return;
        }

        // For single-price styles, go directly to addons
        setSelectedStyle({
            _id: style._id,
            name: style.name,
            category: style.category,
            price: style.price,
            imageUrl: style.imageUrl || '',
        });
        router.push('/book/addons');
    };

    const formatPrice = (price: number) => {
        return `GH₵${(price || 0).toLocaleString()}`;
    };

    // Get display price (minimum of variations or single price)
    const getDisplayPrice = (style: HairStyle) => {
        if (style.priceVariations && style.priceVariations.length > 0) {
            return Math.min(...style.priceVariations.map(v => v.price));
        }
        return style.price || 0;
    };

    // Check if style has variations
    const hasVariations = (style: HairStyle) => {
        return style.priceVariations && style.priceVariations.length > 0;
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = container.offsetWidth;
            const newIndex = direction === 'left'
                ? Math.max(0, currentIndex - 1)
                : Math.min(styles.length - 1, currentIndex + 1);

            setCurrentIndex(newIndex);
            container.scrollTo({
                left: newIndex * cardWidth,
                behavior: 'smooth'
            });
        }
    };

    // Update current index on scroll
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const cardWidth = container.offsetWidth;
            const index = Math.round(scrollLeft / cardWidth);
            setCurrentIndex(index);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    if (loading) {
        return (
            <div className="w-full py-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Flame className="text-white animate-pulse" size={18} />
                    <h2 className="font-montserrat font-bold text-lg uppercase tracking-wider text-white">Trending Styles</h2>
                </div>
                <div className="w-full bg-gray-800/50 rounded-lg animate-pulse aspect-[4/5]" />
            </div>
        );
    }

    if (styles.length === 0) {
        return null;
    }

    return (
        <motion.div
            className="w-full py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
        >
            {/* Section Header */}
            <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame size={18} className="text-white/70" />
                    <h2 className="font-montserrat font-bold text-lg uppercase tracking-wider text-white">
                        Trending Styles
                    </h2>
                </div>
                <p className="text-xs text-white/60">
                    Tap to book • Swipe to explore
                </p>
            </div>

            {/* Carousel Container - One card at a time */}
            <div className="relative w-full">
                {/* Left Arrow */}
                {currentIndex > 0 && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all"
                        aria-label="Previous style"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}

                {/* Scrollable Container with Snap */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {styles.map((style, index) => (
                        <div
                            key={style._id}
                            className="flex-shrink-0 w-full snap-center px-2"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleStyleClick(style)}
                                className="group cursor-pointer relative overflow-hidden rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 w-full mx-auto max-w-md"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Card with Instagram aspect ratio */}
                                <div className="relative w-full aspect-[4/5]">
                                    <Image
                                        src={style.imageUrl || 'https://res.cloudinary.com/dxq5zhfqw/image/upload/v1765829347/hairengineer/hairstyles/cresotpwclzvqh5moadw.jpg'}
                                        alt={style.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 500px"
                                        className={`object-cover object-${style.imagePosition || 'top'}`}
                                        priority={index === 0}
                                    />

                                    {/* Gradient Overlays */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />

                                    {/* Hot Badge */}
                                    <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                        <Flame size={14} className="text-white" />
                                        <span className="text-xs text-white font-semibold tracking-wide">TRENDING</span>
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 className="text-white font-['Noto_Serif_Display'] text-xl font-semibold mb-2 line-clamp-2">
                                            {style.name}
                                        </h3>
                                        <div className="flex items-center justify-between text-sm mb-3">
                                            <span className="text-white font-medium text-lg">
                                                {hasVariations(style) && <span className="text-sm font-normal text-white/70">From </span>}
                                                {formatPrice(getDisplayPrice(style))}
                                            </span>
                                            {style.duration && (
                                                <span className="flex items-center gap-1 text-white/80 text-sm">
                                                    <Clock size={14} />
                                                    {style.duration}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-white/70 text-sm">
                                            {style.category}
                                        </div>
                                    </div>

                                    {/* Hover Book Button */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-white text-base font-medium px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/80 rounded-full">
                                            Book Now
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                {currentIndex < styles.length - 1 && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all"
                        aria-label="Next style"
                    >
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
                {styles.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setCurrentIndex(index);
                            if (scrollContainerRef.current) {
                                scrollContainerRef.current.scrollTo({
                                    left: index * scrollContainerRef.current.offsetWidth,
                                    behavior: 'smooth'
                                });
                            }
                        }}
                        className={`transition-all duration-300 ${index === currentIndex
                            ? 'w-6 h-2 bg-white rounded-full'
                            : 'w-2 h-2 bg-white/40 rounded-full hover:bg-white/60'
                            }`}
                        aria-label={`Go to style ${index + 1}`}
                    />
                ))}
            </div>

            {/* View All Link */}
            <motion.button
                onClick={() => router.push('/book')}
                className="flex items-center justify-center gap-2 mt-6 mx-auto text-xs text-white/60 hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
            >
                <span>View all styles</span>
                <ChevronRight size={14} />
            </motion.button>
        </motion.div>
    );
}
