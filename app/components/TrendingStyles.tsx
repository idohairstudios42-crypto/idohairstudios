'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBookingCart } from '@/app/lib/BookingCart';

interface HairStyle {
    _id: string;
    category: string;
    name: string;
    value: string;
    price: number;
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

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 280; // Card width + gap
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className="py-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Flame className="text-white animate-pulse" size={18} />
                    <h2 className="font-montserrat font-bold text-lg uppercase tracking-wider text-white">Trending Styles</h2>
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex-shrink-0 w-64 bg-gray-800/50 rounded-lg animate-pulse" style={{ paddingBottom: '125%' }} />
                    ))}
                </div>
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
                    Book instantly • Swipe to explore
                </p>
            </div>

            {/* Carousel Container */}
            <div className="relative -mx-4 sm:-mx-6 md:-mx-8">
                {/* Left Arrow - hidden on mobile, visible on desktop */}
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* Scrollable Row - Netflix style */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-6 md:px-8 py-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {styles.map((style, index) => (
                        <motion.div
                            key={style._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleStyleClick(style)}
                            className="group flex-shrink-0 cursor-pointer relative overflow-hidden rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300"
                            style={{ width: '260px' }}
                            whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.4)" }}
                        >
                            {/* Instagram-like aspect ratio (125% like the reels) */}
                            <div className="relative w-full" style={{ paddingBottom: '125%' }}>
                                <Image
                                    src={style.imageUrl || 'https://res.cloudinary.com/dxq5zhfqw/image/upload/v1765829347/hairengineer/hairstyles/cresotpwclzvqh5moadw.jpg'}
                                    alt={style.name}
                                    fill
                                    sizes="260px"
                                    className={`object-cover object-${style.imagePosition || 'top'}`}
                                />

                                {/* Gradient Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />

                                {/* Hot Badge */}
                                <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                    <Flame size={12} className="text-white" />
                                    <span className="text-[10px] text-white font-semibold tracking-wide">HOT</span>
                                </div>

                                {/* Content Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="text-white font-['Noto_Serif_Display'] text-base font-semibold mb-1 line-clamp-2">
                                        {style.name}
                                    </h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white font-medium">
                                            {formatPrice(style.price)}
                                        </span>
                                        {style.duration && (
                                            <span className="flex items-center gap-1 text-white/70 text-xs">
                                                <Clock size={12} />
                                                {style.duration}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Hover Book Button */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white text-sm font-medium px-5 py-2.5 bg-white/20 backdrop-blur-sm border border-white/50 rounded-full">
                                        Book Now
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Right Arrow - hidden on mobile, visible on desktop */}
                <button
                    onClick={() => scroll('right')}
                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* View All Link */}
            <motion.button
                onClick={() => router.push('/book')}
                className="flex items-center justify-center gap-2 mt-4 mx-auto text-xs text-white/60 hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
            >
                <span>View all styles</span>
                <ChevronRight size={14} />
            </motion.button>
        </motion.div>
    );
}
