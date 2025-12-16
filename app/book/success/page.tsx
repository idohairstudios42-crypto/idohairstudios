'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, Calendar, Receipt, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookingSuccessPage() {
    const searchParams = useSearchParams();

    // Get booking details from URL params
    const styleName = searchParams.get('style') || 'Hair Service';
    const category = searchParams.get('category') || '';
    const date = searchParams.get('date') || '';
    const time = searchParams.get('time') || '';
    const total = searchParams.get('total') || '0';
    const addons = searchParams.get('addons')?.split(',').filter(Boolean) || [];
    const customerName = searchParams.get('name') || 'Valued Customer';

    const formatPrice = (amount: string) => {
        return `GH₵${parseFloat(amount || '0').toLocaleString()}`;
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="text-center mb-6"
                >
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                </motion.div>

                {/* Thank You Message */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-['Noto_Serif_Display'] text-white mb-2">
                        Thank You, {customerName}!
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Your booking has been confirmed. We can't wait to see you!
                    </p>
                </div>

                {/* Receipt Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl overflow-hidden mb-6"
                >
                    {/* Receipt Header */}
                    <div className="bg-white/5 px-5 py-3 border-b border-gray-800 flex items-center gap-2">
                        <Receipt size={18} className="text-white" />
                        <span className="text-white font-medium">Booking Receipt</span>
                    </div>

                    {/* Receipt Body */}
                    <div className="p-5 space-y-4">
                        {/* Style Info */}
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Service</p>
                            <p className="text-white font-medium">{styleName}</p>
                            {category && <p className="text-gray-400 text-sm">{category}</p>}
                        </div>

                        {/* Date & Time */}
                        <div className="flex gap-6">
                            <div className="flex-1">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Date</p>
                                <p className="text-white text-sm">{date || 'Not specified'}</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Time</p>
                                <div className="flex items-center gap-1 text-white text-sm">
                                    <Clock size={14} className="text-gray-400" />
                                    {time || 'Not specified'}
                                </div>
                            </div>
                        </div>

                        {/* Add-ons */}
                        {addons.length > 0 && (
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Add-ons</p>
                                <div className="flex flex-wrap gap-2">
                                    {addons.map((addon, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 bg-white/10 text-white text-xs px-2 py-1 rounded-full"
                                        >
                                            <Sparkles size={10} />
                                            {addon}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-dashed border-gray-700 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Total Paid</span>
                                <span className="text-xl font-bold text-white">{formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* What's Next */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6"
                >
                    <h2 className="text-sm font-medium text-white mb-3">What's Next?</h2>
                    <ul className="text-sm text-gray-400 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-white mt-0.5">✓</span>
                            WhatsApp confirmation coming shortly
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-white mt-0.5">✓</span>
                            Arrive 10 minutes before your appointment
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-white mt-0.5">✓</span>
                            Bring reference photos if you have any
                        </li>
                    </ul>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/"
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl transition text-sm"
                    >
                        <Home size={16} />
                        Back to Home
                    </Link>
                    <Link
                        href="/book"
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black py-3 px-6 rounded-xl transition text-sm font-medium"
                    >
                        <Calendar size={16} />
                        Book Another
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
