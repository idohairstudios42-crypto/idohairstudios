'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, User, Phone, MessageCircle } from 'lucide-react';
import { useBookingCart } from '@/app/lib/BookingCart';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Use existing PaystackPop type from AppointmentForm.tsx

export default function CheckoutPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        whatsapp: '',
        snapchat: '',
        hairColor: 'black',
        preferredLength: 'shoulder',
    });
    const paystackScriptLoaded = useRef(false);
    const router = useRouter();
    const {
        selectedStyle,
        selectedAddOns,
        selectedDate,
        selectedTime,
        getTotal,
        getBasePrice,
        getAddOnsTotal,
        clearCart
    } = useBookingCart();

    useEffect(() => {
        if (!selectedStyle || !selectedDate || !selectedTime) {
            router.push('/book');
            return;
        }

        // Load Paystack script
        if (!paystackScriptLoaded.current) {
            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.async = true;
            document.body.appendChild(script);
            paystackScriptLoaded.current = true;
        }
    }, [selectedStyle, selectedDate, selectedTime, router]);

    const formatPrice = (price: number) => {
        return `GH₵${price.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Please enter your name');
            return false;
        }
        if (!formData.phone.trim()) {
            toast.error('Please enter your phone number');
            return false;
        }
        if (!formData.whatsapp.trim()) {
            toast.error('Please enter your WhatsApp number');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Open payment window first (must happen before async calls due to popup blockers)
            const paymentWindow = window.open('about:blank', '_blank', 'width=600,height=700');

            if (!paymentWindow) {
                toast.error('Please allow pop-ups to complete payment');
                setLoading(false);
                return;
            }

            // Initialize payment via server-side API (same pattern as AppointmentForm)
            console.log('DEBUG - selectedStyle:', selectedStyle);
            console.log('DEBUG - selectedStyle.name:', selectedStyle?.name);
            console.log('DEBUG - formData:', formData);

            const initResponse = await fetch('/api/initialize-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: `${formData.phone.replace(/\D/g, '')}@bookings.idohairstudios.com`,
                    amount: getTotal(),
                    name: formData.name,
                    phone: formData.phone,
                    serviceId: selectedStyle?.name,
                    metadata: {
                        service: selectedStyle?.name,
                        serviceCategory: selectedStyle?.category,
                        date: selectedDate?.toISOString(),
                        preferredLength: formData.preferredLength,
                        snapchat: formData.snapchat,
                        whatsapp: formData.whatsapp,
                        hairColor: formData.hairColor,
                        currency: 'GHS',
                        price: getTotal(),
                        addOns: selectedAddOns.map(a => ({ name: a.name, price: a.price }))
                    }
                })
            });

            if (!initResponse.ok) {
                const errorData = await initResponse.json();
                paymentWindow.close();
                throw new Error(errorData.error || 'Failed to initialize payment');
            }

            const initData = await initResponse.json();
            const reference = initData.data?.reference;

            if (!reference || !initData.data?.authorization_url) {
                paymentWindow.close();
                throw new Error('Invalid payment initialization response');
            }

            // Redirect payment window to Paystack
            paymentWindow.location.href = initData.data.authorization_url;

            // Note: Appointment is already created by /api/initialize-payment
            // We just need to poll for payment verification

            // Poll for payment verification
            let attempts = 0;
            const maxAttempts = 60;

            const checkPayment = async () => {
                attempts++;

                try {
                    const verifyResponse = await fetch('/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reference })
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyData.success) {
                        // Build success URL with booking details before clearing cart
                        const successParams = new URLSearchParams({
                            style: selectedStyle?.name || '',
                            category: selectedStyle?.category || '',
                            date: selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : '',
                            time: selectedTime || '',
                            total: getTotal().toString(),
                            addons: selectedAddOns.map(a => a.name).join(','),
                            name: formData.name,
                        });

                        clearCart();
                        toast.success('Booking confirmed!');
                        router.push(`/book/success?${successParams.toString()}`);
                        return;
                    }

                    if (paymentWindow.closed) {
                        toast.error('Payment window was closed');
                        setLoading(false);
                        return;
                    }

                    if (attempts < maxAttempts) {
                        setTimeout(checkPayment, 5000);
                    } else {
                        toast.error('Payment verification timed out. Please contact support if you were charged.');
                        setLoading(false);
                    }
                } catch (err) {
                    console.error('Verification error:', err);
                    if (attempts < maxAttempts && !paymentWindow.closed) {
                        setTimeout(checkPayment, 5000);
                    } else {
                        setLoading(false);
                    }
                }
            };

            setTimeout(checkPayment, 5000);

        } catch (err) {
            console.error('Payment error:', err);
            toast.error(err instanceof Error ? err.message : 'An error occurred. Please try again.');
            setLoading(false);
        }
    };

    if (!selectedStyle || !selectedDate || !selectedTime) {
        return null;
    }

    return (
        <div className="min-h-screen w-full px-4 py-8 pb-8 bg-black">
            {/* Header */}
            <div className="mb-6">
                <Link href="/book/schedule" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Schedule
                </Link>
                <h1 className="text-3xl md:text-4xl font-['Noto_Serif_Display'] text-white mb-2">
                    Checkout
                </h1>
                <p className="text-gray-400">
                    Review your booking and complete payment
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Summary */}
                <div className="order-2 lg:order-1">
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-5">
                        <h2 className="text-lg font-['Noto_Serif_Display'] text-white mb-4">Order Summary</h2>

                        {/* Style */}
                        <div className="flex justify-between items-center py-3 border-b border-gray-800">
                            <div>
                                <span className="text-white font-medium">{selectedStyle.name}</span>
                                <span className="text-xs text-gray-500 block">{selectedStyle.category}</span>
                            </div>
                            <span className="text-white">{formatPrice(getBasePrice())}</span>
                        </div>

                        {/* Add-ons */}
                        {selectedAddOns.length > 0 && (
                            <div className="py-3 border-b border-gray-800">
                                <span className="text-sm text-gray-400 mb-2 block">Add-ons</span>
                                {selectedAddOns.map((addOn) => (
                                    <div key={addOn._id} className="flex justify-between items-center py-1">
                                        <span className="text-gray-300 text-sm">{addOn.name}</span>
                                        <span className="text-gray-400 text-sm">{formatPrice(addOn.price)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Date & Time */}
                        <div className="py-3 border-b border-gray-800">
                            <span className="text-sm text-gray-400">Appointment</span>
                            <div className="text-white">
                                {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Subtotal</span>
                                <span className="text-gray-300">{formatPrice(getBasePrice())}</span>
                            </div>
                            {getAddOnsTotal() > 0 && (
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-gray-400">Add-ons</span>
                                    <span className="text-gray-300">{formatPrice(getAddOnsTotal())}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800">
                                <span className="text-xl font-bold text-white">Total</span>
                                <span className="text-2xl font-bold text-white">{formatPrice(getTotal())}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Form */}
                <div className="order-1 lg:order-2">
                    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-5">
                        <h2 className="text-lg font-['Noto_Serif_Display'] text-white mb-4">Your Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                                    <User size={14} />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-white focus:ring-1 focus:ring-white"
                                    placeholder="Your full name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                                    <Phone size={14} />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-white focus:ring-1 focus:ring-white"
                                    placeholder="0XX XXX XXXX"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                                    <MessageCircle size={14} />
                                    WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-white focus:ring-1 focus:ring-white"
                                    placeholder="0XX XXX XXXX"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-1">Snapchat (optional)</label>
                                <input
                                    type="text"
                                    name="snapchat"
                                    value={formData.snapchat}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-white focus:ring-1 focus:ring-white"
                                    placeholder="@username"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Hair Color</label>
                                    <select
                                        name="hairColor"
                                        value={formData.hairColor}
                                        onChange={handleInputChange}
                                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-white focus:ring-1 focus:ring-white"
                                    >
                                        <option value="black">Black</option>
                                        <option value="brown">Brown</option>
                                        <option value="blonde">Blonde</option>
                                        <option value="red">Red</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Preferred Length</label>
                                    <select
                                        name="preferredLength"
                                        value={formData.preferredLength}
                                        onChange={handleInputChange}
                                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-white focus:ring-1 focus:ring-white"
                                    >
                                        <option value="shoulder">Shoulder</option>
                                        <option value="bra">Bra Length</option>
                                        <option value="waist">Waist</option>
                                        <option value="butt">Butt Length</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-6 w-full bg-white hover:bg-gray-200 disabled:bg-gray-700 text-black py-4 px-6 rounded-xl font-medium transition flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={20} />
                                    Pay {formatPrice(getTotal())}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
