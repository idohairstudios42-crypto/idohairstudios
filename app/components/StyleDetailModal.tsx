'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Check } from 'lucide-react';

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
    duration: string;
    imagePosition?: 'top' | 'center' | 'bottom';
    isTrending: boolean;
    isActive: boolean;
}

interface StyleDetailModalProps {
    style: HairStyle | null;
    isOpen: boolean;
    onClose: () => void;
    onSelect: (style: HairStyle, selectedVariation: { name: string; price: number } | null) => void;
}

export default function StyleDetailModal({ style, isOpen, onClose, onSelect }: StyleDetailModalProps) {
    const [selectedVariation, setSelectedVariation] = useState<PriceVariation | null>(null);

    // Reset selection when style changes
    useEffect(() => {
        if (style?.priceVariations && style.priceVariations.length > 0) {
            setSelectedVariation(style.priceVariations[0]);
        } else {
            setSelectedVariation(null);
        }
    }, [style]);

    if (!style) return null;

    const hasVariations = style.priceVariations && style.priceVariations.length > 0;
    const displayPrice = hasVariations
        ? Math.min(...style.priceVariations!.map(v => v.price))
        : style.price;
    const selectedPrice = selectedVariation?.price ?? style.price;

    const formatPrice = (price: number) => {
        return `GH₵${(price || 0).toLocaleString()}`;
    };

    const handleSelect = () => {
        onSelect(style, selectedVariation);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-lg bg-gray-900 rounded-t-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Image */}
                        <div className="relative aspect-[4/3]">
                            <Image
                                src={style.imageUrl || 'https://res.cloudinary.com/dxq5zhfqw/image/upload/v1765829347/hairengineer/hairstyles/cresotpwclzvqh5moadw.jpg'}
                                alt={style.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 500px"
                                className={`object-cover object-${style.imagePosition || 'top'}`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
                            >
                                <X size={24} />
                            </button>

                            {/* Style Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="text-white/70 text-sm mb-1">{style.category}</div>
                                <h2 className="text-2xl font-['Noto_Serif_Display'] text-white font-semibold mb-2">
                                    {style.name}
                                </h2>
                                <div className="flex items-center gap-4 text-white/80">
                                    <span className="text-xl font-medium">
                                        {hasVariations ? `From ${formatPrice(displayPrice)}` : formatPrice(displayPrice)}
                                    </span>
                                    {style.duration && (
                                        <span className="flex items-center gap-1 text-sm">
                                            <Clock size={14} />
                                            {style.duration}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Description */}
                            {style.description && (
                                <p className="text-gray-400 text-sm">{style.description}</p>
                            )}

                            {/* Variation Selection */}
                            {hasVariations && (
                                <div className="space-y-3">
                                    <label className="text-sm text-gray-300 font-medium">
                                        {style.variationLabel || 'Select Length'}
                                    </label>
                                    <div className="space-y-2">
                                        {style.priceVariations!.map((variation, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedVariation(variation)}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedVariation?.name === variation.name
                                                    ? 'bg-white/10 border-white'
                                                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedVariation?.name === variation.name
                                                        ? 'bg-white border-white'
                                                        : 'border-gray-600'
                                                        }`}>
                                                        {selectedVariation?.name === variation.name && (
                                                            <Check size={12} className="text-black" />
                                                        )}
                                                    </div>
                                                    <span className="text-white font-medium">{variation.name}</span>
                                                </div>
                                                <span className="text-white font-bold">{formatPrice(variation.price)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Continue Button */}
                            <button
                                onClick={handleSelect}
                                disabled={hasVariations && !selectedVariation}
                                className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:text-gray-500 text-black font-medium py-4 rounded-xl transition flex items-center justify-center gap-2"
                            >
                                <span>Continue with {hasVariations && selectedVariation ? selectedVariation.name : 'this style'}</span>
                                <span className="font-bold">{formatPrice(selectedPrice)}</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
