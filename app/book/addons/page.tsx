'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useBookingCart } from '@/app/lib/BookingCart';

interface AddOnService {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    isActive: boolean;
}

export default function AddonsPage() {
    const [services, setServices] = useState<AddOnService[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { selectedStyle, selectedAddOns, toggleAddOn, isAddOnSelected, getTotal, getBasePrice, getAddOnsTotal } = useBookingCart();

    useEffect(() => {
        // Redirect if no style selected
        if (!loading && !selectedStyle) {
            router.push('/book');
            return;
        }
        fetchServices();
    }, [selectedStyle, loading, router]);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/addon-services');
            if (response.ok) {
                const data = await response.json();
                setServices(data.filter((s: AddOnService) => s.isActive));
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return `GH₵${(price || 0).toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;
    };

    const handleContinue = () => {
        router.push('/book/schedule');
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!selectedStyle) {
        return null;
    }

    // Group services by category
    const groupedServices = services.reduce((acc, service) => {
        const cat = service.category || 'general';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(service);
        return acc;
    }, {} as Record<string, AddOnService[]>);

    return (
        <div className="min-h-screen w-full px-4 py-8 pb-32 bg-black">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href={`/book/${encodeURIComponent(selectedStyle.category.toLowerCase())}`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Styles
                </Link>
                <h1 className="text-3xl md:text-4xl font-['Noto_Serif_Display'] text-white mb-2">
                    Additional Services
                </h1>
                <p className="text-gray-400">
                    Select any add-on services you'd like (optional)
                </p>
            </div>

            {/* Selected Style Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm text-gray-400">Selected Style</span>
                        <h3 className="text-lg font-medium text-white">{selectedStyle.name}</h3>
                    </div>
                    <span className="text-xl font-bold text-white">{formatPrice(selectedStyle.price)}</span>
                </div>
            </div>

            {/* Services List */}
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
                <div key={category} className="mb-6">
                    <h2 className="text-lg font-medium text-gray-300 capitalize mb-3">{category}</h2>
                    <div className="space-y-3">
                        {categoryServices.map((service, index) => (
                            <motion.div
                                key={service._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <button
                                    onClick={() => toggleAddOn({ _id: service._id, name: service.name, price: service.price })}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${isAddOnSelected(service._id)
                                        ? 'bg-white/10 border-white'
                                        : 'bg-gray-900/50 border-gray-800 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${isAddOnSelected(service._id)
                                                ? 'bg-white border-white'
                                                : 'border-gray-600'
                                                }`}>
                                                {isAddOnSelected(service._id) && <Check size={14} className="text-black" />}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">{service.name}</h3>
                                                {service.description && (
                                                    <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-white font-medium whitespace-nowrap ml-4">
                                            {formatPrice(service.price)}
                                        </span>
                                    </div>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}

            {services.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    No additional services available. Continue to scheduling.
                </div>
            )}

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-4">
                <div className="max-w-screen-lg mx-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-sm text-gray-400">Total</span>
                            <div className="text-2xl font-bold text-white">{formatPrice(getTotal())}</div>
                            <div className="text-xs text-gray-500">
                                Base: {formatPrice(getBasePrice())} + Add-ons: {formatPrice(getAddOnsTotal())}
                            </div>
                        </div>
                        <button
                            onClick={handleContinue}
                            className="bg-white hover:bg-gray-200 text-black py-3 px-6 rounded-xl font-medium transition flex items-center gap-2"
                        >
                            Continue
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
