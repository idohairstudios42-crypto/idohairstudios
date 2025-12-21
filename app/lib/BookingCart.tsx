'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface SelectedStyle {
    _id: string;
    name: string;
    category: string;
    price: number;
    variationName?: string;  // Selected variation name e.g. "Midback", "Large Waist | 4 Rows"
    imageUrl?: string;
}

export interface SelectedAddOn {
    _id: string;
    name: string;
    price: number;
}

export interface BookingCartState {
    selectedStyle: SelectedStyle | null;
    selectedAddOns: SelectedAddOn[];
    selectedDate: Date | null;
    selectedTime: string | null;
    customerDetails: {
        name: string;
        phone: string;
        whatsapp: string;
        snapchat: string;
        hairColor: string;
        preferredLength: string;
    } | null;
}

interface BookingCartContextType extends BookingCartState {
    setSelectedStyle: (style: SelectedStyle | null) => void;
    addAddOn: (addOn: SelectedAddOn) => void;
    removeAddOn: (addOnId: string) => void;
    toggleAddOn: (addOn: SelectedAddOn) => void;
    setSelectedDate: (date: Date | null) => void;
    setSelectedTime: (time: string | null) => void;
    setCustomerDetails: (details: BookingCartState['customerDetails']) => void;
    getTotal: () => number;
    getBasePrice: () => number;
    getAddOnsTotal: () => number;
    clearCart: () => void;
    isAddOnSelected: (addOnId: string) => boolean;
}

const BookingCartContext = createContext<BookingCartContextType | undefined>(undefined);

const initialState: BookingCartState = {
    selectedStyle: null,
    selectedAddOns: [],
    selectedDate: null,
    selectedTime: null,
    customerDetails: null,
};

export function BookingCartProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<BookingCartState>(initialState);

    const setSelectedStyle = useCallback((style: SelectedStyle | null) => {
        setState(prev => ({ ...prev, selectedStyle: style }));
    }, []);

    const addAddOn = useCallback((addOn: SelectedAddOn) => {
        setState(prev => ({
            ...prev,
            selectedAddOns: [...prev.selectedAddOns.filter(a => a._id !== addOn._id), addOn],
        }));
    }, []);

    const removeAddOn = useCallback((addOnId: string) => {
        setState(prev => ({
            ...prev,
            selectedAddOns: prev.selectedAddOns.filter(a => a._id !== addOnId),
        }));
    }, []);

    const toggleAddOn = useCallback((addOn: SelectedAddOn) => {
        setState(prev => {
            const exists = prev.selectedAddOns.some(a => a._id === addOn._id);
            if (exists) {
                return { ...prev, selectedAddOns: prev.selectedAddOns.filter(a => a._id !== addOn._id) };
            }
            return { ...prev, selectedAddOns: [...prev.selectedAddOns, addOn] };
        });
    }, []);

    const setSelectedDate = useCallback((date: Date | null) => {
        setState(prev => ({ ...prev, selectedDate: date }));
    }, []);

    const setSelectedTime = useCallback((time: string | null) => {
        setState(prev => ({ ...prev, selectedTime: time }));
    }, []);

    const setCustomerDetails = useCallback((details: BookingCartState['customerDetails']) => {
        setState(prev => ({ ...prev, customerDetails: details }));
    }, []);

    const getBasePrice = useCallback(() => {
        // Default to 10 GHS if no price set
        return state.selectedStyle?.price || 10;
    }, [state.selectedStyle]);

    const getAddOnsTotal = useCallback(() => {
        return state.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    }, [state.selectedAddOns]);

    const getTotal = useCallback(() => {
        const total = getBasePrice() + getAddOnsTotal();
        // Ensure minimum of 10 GHS
        return Math.max(total, 10);
    }, [getBasePrice, getAddOnsTotal]);

    const clearCart = useCallback(() => {
        setState(initialState);
    }, []);

    const isAddOnSelected = useCallback((addOnId: string) => {
        return state.selectedAddOns.some(a => a._id === addOnId);
    }, [state.selectedAddOns]);

    return (
        <BookingCartContext.Provider
            value={{
                ...state,
                setSelectedStyle,
                addAddOn,
                removeAddOn,
                toggleAddOn,
                setSelectedDate,
                setSelectedTime,
                setCustomerDetails,
                getTotal,
                getBasePrice,
                getAddOnsTotal,
                clearCart,
                isAddOnSelected,
            }}
        >
            {children}
        </BookingCartContext.Provider>
    );
}

export function useBookingCart() {
    const context = useContext(BookingCartContext);
    if (context === undefined) {
        throw new Error('useBookingCart must be used within a BookingCartProvider');
    }
    return context;
}
