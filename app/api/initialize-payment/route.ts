import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import AppointmentModel from '@/app/models/Appointment';
import HairStyle from '@/app/models/HairStyle';
import AvailableDate from '@/app/models/AvailableDate';
import SystemSettings from '@/app/models/SystemSettings';

// Function to generate a unique reference for Paystack
function generateReference() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `HAIRSLOT_${timestamp}_${random}`;
}

export async function POST(request: Request) {
  try {
    // Get payment details from request
    const {
      email,
      amount,
      name,
      phone,
      serviceId,
      metadata
    } = await request.json();

    // Validate required fields
    if (!email || !amount || !name || !phone || !serviceId || !metadata || !metadata.date) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Please provide all required information.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate a unique reference for this transaction
    const reference = generateReference();

    // Get config settings from environment variables
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Payment service is not properly configured' },
        { status: 500 }
      );
    }

    // Verify service and date are valid
    try {
      // Search for service by value, name, or _id (to handle different input formats)
      let service = await HairStyle.findOne({ value: serviceId });
      if (!service) {
        service = await HairStyle.findOne({ name: serviceId });
      }
      if (!service && serviceId.match(/^[0-9a-fA-F]{24}$/)) {
        service = await HairStyle.findById(serviceId);
      }

      if (!service) {
        console.log('Service not found for serviceId:', serviceId);
        return NextResponse.json(
          { error: 'Invalid service selected' },
          { status: 400 }
        );
      }

      // Check if date is available
      const selectedDate = new Date(metadata.date);
      const dateRecord = await AvailableDate.findOne({
        date: {
          $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
          $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
        }
      });

      if (!dateRecord) {
        return NextResponse.json(
          { error: 'Selected date is not available' },
          { status: 400 }
        );
      }

      // Check if date is fully booked
      if (dateRecord.currentAppointments >= dateRecord.maxAppointments) {
        return NextResponse.json(
          { error: 'Selected date is fully booked' },
          { status: 400 }
        );
      }

      // Create a pending appointment record before payment
      const appointmentData = {
        name: name,
        phone: phone,
        snapchat: metadata.snapchat || '',
        whatsapp: metadata.whatsapp,
        service: service.name, // Use the found service name, not the input serviceId
        serviceCategory: metadata.serviceCategory || service.category,
        date: new Date(metadata.date),
        time: metadata.time,
        preferredLength: metadata.preferredLength,
        hairColor: metadata.hairColor || 'black',
        totalAmount: amount,
        amountPaid: 0,
        paymentStatus: 'unpaid',
        status: 'pending',
        paystackReference: reference,
        addOns: metadata.addOns || [],
      };

      console.log('Creating pending appointment with data:', JSON.stringify(appointmentData));

      // Create the appointment document
      const appointment = new AppointmentModel(appointmentData);

      try {
        // Save the appointment to the database
        await appointment.save();
        console.log('Appointment created successfully with ID:', appointment._id);
      } catch (saveError) {
        console.error('Error saving appointment:', saveError);
        return NextResponse.json(
          { error: 'Failed to create pending appointment', details: (saveError instanceof Error) ? saveError.message : String(saveError) },
          { status: 500 }
        );
      }

      // Initialize payment with Paystack
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Convert to kobo/pesewas (smallest currency unit)
          reference,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-success?reference=${reference}`,
          metadata: {
            name,
            phone,
            service_id: serviceId,
            ...metadata
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Paystack initialization error:', errorData);

        // Delete the pending appointment if payment initialization fails
        await AppointmentModel.findOneAndDelete({ paystackReference: reference });

        return NextResponse.json(
          { error: 'Payment initialization failed', details: errorData.message || 'Error communicating with payment provider' },
          { status: 500 }
        );
      }

      // Get and return Paystack response
      const data = await response.json();
      return NextResponse.json(data);

    } catch (error) {
      console.error('Service/date verification error:', error);
      return NextResponse.json(
        { error: 'Failed to verify service or date', details: (error instanceof Error) ? error.message : String(error) },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Payment initialization failed', details: (error instanceof Error) ? error.message : String(error) },
      { status: 500 }
    );
  }
} 