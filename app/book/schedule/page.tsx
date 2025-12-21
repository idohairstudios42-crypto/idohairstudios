'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBookingCart } from '@/app/lib/BookingCart';
import { format, isSameDay, isSameMonth, addMonths, subMonths, isBefore } from 'date-fns';

interface AvailableDate {
    _id: string;
    date: string;
    maxAppointments: number;
    currentAppointments: number;
}

export default function SchedulePage() {
    const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const router = useRouter();
    const { selectedStyle, selectedDate, selectedTime, setSelectedDate, setSelectedTime, getTotal } = useBookingCart();
    const timeSectionRef = useRef<HTMLDivElement>(null);

    const timeSlots = [
        '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
        '04:00 PM', '05:00 PM'
    ];

    useEffect(() => {
        if (!loading && !selectedStyle) {
            router.push('/book');
            return;
        }
        if (availableDates.length === 0) {
            fetchAvailableDates(currentMonth);
        }
    }, [selectedStyle, loading, router]);

    useEffect(() => {
        if (!loading && selectedStyle) {
            fetchAvailableDates(currentMonth);
        }
    }, [currentMonth]);

    const fetchAvailableDates = async (month: Date) => {
        try {
            setLoading(true);
            const monthParam = format(month, 'yyyy-MM');
            const response = await fetch(`/api/available-dates?month=${monthParam}`);
            if (response.ok) {
                const data = await response.json();
                setAvailableDates(data);
            }
        } catch (error) {
            console.error('Error fetching dates:', error);
        } finally {
            setLoading(false);
        }
    };

    const datesInCurrentMonth = availableDates;
    const today = new Date();
    const hasPrevMonth = !isSameMonth(currentMonth, today) && !isBefore(currentMonth, today);
    const hasNextMonth = true;

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null);

        // Auto-scroll to time section on mobile after a short delay
        setTimeout(() => {
            timeSectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
    };

    const handleContinue = () => {
        if (selectedDate && selectedTime) {
            router.push('/book/checkout');
        }
    };

    const formatPrice = (price: number) => {
        return `GH₵${price.toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;
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

    return (
        <div className="min-h-screen w-full px-4 py-8 pb-32 bg-black">
            {/* Header */}
            <div className="mb-6">
                <Link href="/book/addons" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Add-ons
                </Link>
                <h1 className="text-3xl md:text-4xl font-['Noto_Serif_Display'] text-white mb-2">
                    Select Date & Time
                </h1>
                <p className="text-gray-400">
                    Choose an available date and time slot
                </p>
            </div>

            {/* Date Selection */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-medium text-white">Available Dates</h2>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4 bg-gray-900 rounded-xl border border-gray-800 p-3">
                    <button
                        onClick={handlePrevMonth}
                        disabled={!hasPrevMonth}
                        className="p-2 rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </button>

                    <h3 className="text-lg font-medium text-white">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h3>

                    <button
                        onClick={handleNextMonth}
                        disabled={!hasNextMonth}
                        className="p-2 rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Dates Grid */}
                <div className="min-h-[200px] bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <AnimatePresence mode="wait">
                        {datesInCurrentMonth.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-[160px] text-center"
                            >
                                <Calendar className="w-10 h-10 text-gray-700 mb-2" />
                                <p className="text-gray-500">No available dates this month</p>
                                <p className="text-xs text-gray-600 mt-1">Try another month</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={currentMonth.toISOString()}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2"
                            >
                                {datesInCurrentMonth.map((dateObj) => {
                                    const date = new Date(dateObj.date);
                                    const isSelected = selectedDate && isSameDay(selectedDate, date);
                                    const spotsLeft = dateObj.maxAppointments - dateObj.currentAppointments;

                                    return (
                                        <motion.button
                                            key={dateObj._id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDateSelect(date)}
                                            className={`p-3 rounded-xl border text-center transition-all ${isSelected
                                                ? 'bg-white/10 border-white'
                                                : 'bg-black border-gray-700 hover:border-gray-500'
                                                }`}
                                        >
                                            <div className="text-xs text-gray-400">{format(date, 'EEE')}</div>
                                            <div className="text-xl font-bold text-white">{format(date, 'd')}</div>
                                            <div className={`text-xs mt-1 ${spotsLeft <= 2 ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {spotsLeft} {spotsLeft === 1 ? 'slot' : 'slots'}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
                <motion.div
                    ref={timeSectionRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-white" />
                        <h2 className="text-lg font-medium text-white">Select Time</h2>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {timeSlots.map((time) => {
                            const isSelected = selectedTime === time;

                            return (
                                <motion.button
                                    key={time}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleTimeSelect(time)}
                                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${isSelected
                                        ? 'bg-white/10 border-white text-white'
                                        : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'
                                        }`}
                                >
                                    {time}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-4">
                <div className="max-w-screen-lg mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm text-gray-400">Total</span>
                            <div className="text-2xl font-bold text-white">{formatPrice(getTotal())}</div>
                        </div>
                        <button
                            onClick={handleContinue}
                            disabled={!selectedDate || !selectedTime}
                            className="bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-black py-3 px-6 rounded-xl font-medium transition flex items-center gap-2"
                        >
                            Continue to Checkout
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
