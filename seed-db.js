// Direct MongoDB seeding script
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env');
  console.error('Please add MONGODB_URI to your .env file');
  process.exit(1);
}

// Define schemas for our models
const ServiceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const HairStyleSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  value: { type: String, required: true, unique: true },
  price: { type: Number, required: false },
  description: { type: String, required: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const AvailableDateSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  maxAppointments: { type: Number, required: true, min: 1, default: 5 },
  currentAppointments: { type: Number, default: 0 }
}, { timestamps: true });

const PaymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, required: true },
  reference: { type: String, required: false },
  note: { type: String, default: '' }
});

const AppointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  snapchat: { type: String, required: false },
  whatsapp: { type: String, required: true },
  service: { type: String, required: true },
  serviceCategory: { type: String, required: true },
  hairColor: { type: String, required: true, default: 'black' },
  preferredLength: { type: String, required: true, enum: ['shoulder', 'bra', 'waist', 'butt'] },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  totalAmount: { type: Number, required: true, default: 0 },
  amountPaid: { type: Number, required: true, default: 0 },
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'full'], default: 'unpaid' },
  paystackReference: { type: String, required: false, index: true },
  paymentHistory: [PaymentHistorySchema]
}, { timestamps: true });

// Add pre-save middleware to automatically update payment status
AppointmentSchema.pre('save', function(next) {
  if (this.amountPaid === 0) {
    this.paymentStatus = 'unpaid';
  } else if (this.amountPaid < this.totalAmount) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'full';
  }
  next();
});

// SystemSettings Schema
const SystemSettingsSchema = new mongoose.Schema({
  paymentRequired: { type: Boolean, default: true },
  paymentTimeoutMinutes: { type: Number, default: 10 },
  defaultAppointmentStatus: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  defaultPrice: { type: Number, default: 2 }
}, { timestamps: true });

// Register models (clear existing models to avoid conflicts)
if (mongoose.models.ServiceCategory) delete mongoose.models.ServiceCategory;
if (mongoose.models.HairStyle) delete mongoose.models.HairStyle;
if (mongoose.models.AvailableDate) delete mongoose.models.AvailableDate;
if (mongoose.models.Appointment) delete mongoose.models.Appointment;
if (mongoose.models.SystemSettings) delete mongoose.models.SystemSettings;

const ServiceCategory = mongoose.model('ServiceCategory', ServiceCategorySchema);
const HairStyle = mongoose.model('HairStyle', HairStyleSchema);
const AvailableDate = mongoose.model('AvailableDate', AvailableDateSchema);
const Appointment = mongoose.model('Appointment', AppointmentSchema);
const SystemSettings = mongoose.model('SystemSettings', SystemSettingsSchema);

// Default data
const defaultCategories = [
  { name: 'LOCS', description: 'Various styles of locs', order: 1 },
  { name: 'TWIST', description: 'Various twisting techniques', order: 2 },
  { name: 'SEW IN', description: 'Sew-in extensions and weaves', order: 3 },
  { name: 'BRAIDS', description: 'Various braiding styles', order: 4 },
  { name: 'CORNROWS', description: 'Cornrow braiding styles', order: 5 },
  { name: 'NATURAL', description: 'Natural hairstyles', order: 6 },
  { name: 'COLORING', description: 'Hair coloring services', order: 7 },
];

// Default hair styles - included directly
const defaultHairStyles = [
  // LOCS
  { category: 'LOCS', name: 'Soft Locs', value: 'locs-soft-locs' },
  { category: 'LOCS', name: 'Faux Locs - Small', value: 'locs-faux-locs-small' },
  { category: 'LOCS', name: 'Faux Locs - Medium', value: 'locs-faux-locs-medium' },
  { category: 'LOCS', name: 'Faux Locs - Large', value: 'locs-faux-locs-large' },
  { category: 'LOCS', name: 'Faux Locs - Jumbo', value: 'locs-faux-locs-jumbo' },
  { category: 'LOCS', name: 'Invisible Locs - Medium', value: 'locs-invisible-locs-medium' },
  { category: 'LOCS', name: 'Invisible Locs - Large', value: 'locs-invisible-locs-large' },
  { category: 'LOCS', name: 'Butterfly Locs - Medium', value: 'locs-butterfly-locs-medium' },
  { category: 'LOCS', name: 'Butterfly Locs - Large', value: 'locs-butterfly-locs-large' },
  { category: 'LOCS', name: 'Goddess Locs - Medium', value: 'locs-goddess-locs-medium' },
  { category: 'LOCS', name: 'Goddess Locs - Large', value: 'locs-goddess-locs-large' },
  { category: 'LOCS', name: 'Boho Locs - Medium', value: 'locs-boho-locs-medium' },
  { category: 'LOCS', name: 'Boho Locs - Large', value: 'locs-boho-locs-large' },
  { category: 'LOCS', name: 'Ocean Locs - Medium', value: 'locs-ocean-locs-medium' },
  { category: 'LOCS', name: 'Ocean Locs - Large', value: 'locs-ocean-locs-large' },
  
  // TWIST
  { category: 'TWIST', name: 'Island Twist - Small', value: 'twist-island-twist-small' },
  { category: 'TWIST', name: 'Island Twist - Medium', value: 'twist-island-twist-medium' },
  { category: 'TWIST', name: 'Island Twist - Large', value: 'twist-island-twist-large' },
  { category: 'TWIST', name: 'Island Twist - Jumbo', value: 'twist-island-twist-jumbo' },
  { category: 'TWIST', name: 'Passion Twist - Small', value: 'twist-passion-twist-small' },
  { category: 'TWIST', name: 'Passion Twist - Medium', value: 'twist-passion-twist-medium' },
  { category: 'TWIST', name: 'Passion Twist - Large', value: 'twist-passion-twist-large' },
  { category: 'TWIST', name: 'Passion Twist - Jumbo', value: 'twist-passion-twist-jumbo' },
  { category: 'TWIST', name: 'Senegalese Twist - Medium', value: 'twist-senegalese-twist-medium' },
  { category: 'TWIST', name: 'Marley Twist - Medium', value: 'twist-marley-twist-medium' },
  
  // SEW IN
  { category: 'SEW IN', name: 'Closure Sew-in', value: 'sew-in-closure-sew-in' },
  { category: 'SEW IN', name: 'Versatile Sew-in - with Middle & Side Part & Bun', value: 'sew-in-versatile-sew-in-full' },
  { category: 'SEW IN', name: 'Versatile Sew-in - with Middle Part & Bun', value: 'sew-in-versatile-sew-in-middle' },
  { category: 'SEW IN', name: 'Versatile Sew-in - Side Part & Bun', value: 'sew-in-versatile-sew-in-side' },
  { category: 'SEW IN', name: 'Vixen Sew-in', value: 'sew-in-vixen-sew-in' },
  { category: 'SEW IN', name: 'Frontal Sew-in', value: 'sew-in-frontal-sew-in' },
  
  // BRAIDS
  { category: 'BRAIDS', name: 'Knotless Braids - Small', value: 'braids-knotless-braids-small' },
  { category: 'BRAIDS', name: 'Knotless Braids - Medium', value: 'braids-knotless-braids-medium' },
  { category: 'BRAIDS', name: 'Knotless Braids - Large', value: 'braids-knotless-braids-large' },
  { category: 'BRAIDS', name: 'Knotless Braids - Jumbo', value: 'braids-knotless-braids-jumbo' },
  { category: 'BRAIDS', name: 'Boho Braids - Small', value: 'braids-boho-braids-small' },
  { category: 'BRAIDS', name: 'Boho Braids - Medium', value: 'braids-boho-braids-medium' },
  { category: 'BRAIDS', name: 'Boho Braids - Large', value: 'braids-boho-braids-large' },
  { category: 'BRAIDS', name: 'Boho Braids - Jumbo', value: 'braids-boho-braids-jumbo' },
  { category: 'BRAIDS', name: 'Goddess Braids - Small', value: 'braids-goddess-braids-small' },
  { category: 'BRAIDS', name: 'Goddess Braids - Medium', value: 'braids-goddess-braids-medium' },
  { category: 'BRAIDS', name: 'Goddess Braids - Large', value: 'braids-goddess-braids-large' },
  { category: 'BRAIDS', name: 'Goddess Braids - Jumbo', value: 'braids-goddess-braids-jumbo' },
  { category: 'BRAIDS', name: 'Feed-in Braids', value: 'braids-feed-in-braids' },
  
  // CORNROWS
  { category: 'CORNROWS', name: 'Stitch Cornrows (All Back)', value: 'cornrows-stitch-cornrows-all-back' },
  { category: 'CORNROWS', name: 'Stitch Cornrows with Braid', value: 'cornrows-stitch-cornrows-with-braid' },
  { category: 'CORNROWS', name: 'Lemonade Braids', value: 'cornrows-lemonade-braids' },
  { category: 'CORNROWS', name: 'Ghana Braids', value: 'cornrows-ghana-braids' },
  
  // NATURAL
  { category: 'NATURAL', name: 'Silk Press', value: 'natural-silk-press' },
  { category: 'NATURAL', name: 'Wash and Set', value: 'natural-wash-set' },
  { category: 'NATURAL', name: 'Twist Out', value: 'natural-twist-out' },
  { category: 'NATURAL', name: 'Bantu Knots', value: 'natural-bantu-knots' },
  
  // COLORING
  { category: 'COLORING', name: 'Full Hair Color', value: 'coloring-full-hair' },
  { category: 'COLORING', name: 'Highlights', value: 'coloring-highlights' },
  { category: 'COLORING', name: 'Balayage', value: 'coloring-balayage' },
  { category: 'COLORING', name: 'Ombre', value: 'coloring-ombre' }
];

// Generate available dates (next 30 days)
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate dates for the next 30 days
  for (let i = 1; i <= 30; i++) {
    // Skip some random days to make it more realistic
    if (Math.random() > 0.7) continue;
    
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Random max appointments between 2-5
    const maxAppointments = Math.floor(Math.random() * 4) + 2;
    
    dates.push({
      date: date,
      maxAppointments,
      currentAppointments: 0
    });
  }
  
  return dates;
};

// Generate dummy appointments
const generateAppointments = (availableDates, hairStyles, categories) => {
  const appointments = [];
  const names = [
    'Sophia Johnson', 'Emma Davis', 'Olivia Smith', 'Ava Wilson', 'Isabella Jones',
    'Mia Thomas', 'Charlotte Taylor', 'Amelia Anderson', 'Harper Brown', 'Evelyn Miller'
  ];
  
  const phoneNumbers = [
    '+233501234567', '+233507654321', '+233551234567', '+233559876543', '+233241234567'
  ];
  
  const hairColors = ['black', 'dark brown', 'brown', 'light brown', 'blonde', 'red'];
  const preferredLengths = ['shoulder', 'bra', 'waist', 'butt'];
  const statuses = ['pending', 'confirmed', 'cancelled'];
  const paymentMethods = ['cash', 'momo', 'Paystack'];
  
  // Create 1-3 appointments for each available date (limited to avoid overloading)
  availableDates.slice(0, 10).forEach(dateObj => {
    const numAppointments = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numAppointments && i < dateObj.maxAppointments; i++) {
      // Randomly select a hair style
      const randomStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
      
      // Find the category name for this style
      const categoryName = randomStyle.category;
      
      // Random status
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random price between 150-600 GH₵
      const totalAmount = Math.floor(Math.random() * 450) + 150;
      
      // Random payment (0%, 50%, or 100% of total)
      const paymentPercentage = [0, 0.5, 1][Math.floor(Math.random() * 3)];
      const amountPaid = Math.floor(totalAmount * paymentPercentage);
      
      // Determine payment status
      let paymentStatus = 'unpaid';
      if (amountPaid > 0 && amountPaid < totalAmount) {
        paymentStatus = 'partial';
      } else if (amountPaid >= totalAmount) {
        paymentStatus = 'full';
      }
      
      // Create payment history if payment was made
      const paymentHistory = [];
      if (amountPaid > 0) {
        paymentHistory.push({
          amount: amountPaid,
          date: new Date(),
          method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          note: 'Initial payment'
        });
      }
      
      const nameIndex = Math.floor(Math.random() * names.length);
      const phoneIndex = Math.floor(Math.random() * phoneNumbers.length);
      const preferredLength = preferredLengths[Math.floor(Math.random() * preferredLengths.length)];
      
      const appointmentData = {
        name: names[nameIndex],
        phone: phoneNumbers[phoneIndex],
        whatsapp: phoneNumbers[phoneIndex],
        service: randomStyle.value,
        serviceCategory: categoryName,
        hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
        preferredLength: preferredLength,
        date: dateObj.date,
        status,
        totalAmount,
        amountPaid,
        paymentStatus,
        paymentHistory
      };
      
      // Only add snapchat if it exists (optional field)
      if (Math.random() > 0.5) {
        appointmentData.snapchat = `@${names[nameIndex].split(' ')[0].toLowerCase()}`;
      }
      
      appointments.push(appointmentData);
      
      // Increment current appointments count
      dateObj.currentAppointments++;
    }
  });
  
  return appointments;
};

// Main function to seed database
async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs
    
    const connectionOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(MONGODB_URI, connectionOptions);
    console.log('✅ Connected to MongoDB successfully');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await ServiceCategory.deleteMany({});
    await HairStyle.deleteMany({});
    await AvailableDate.deleteMany({});
    await Appointment.deleteMany({});
    await SystemSettings.deleteMany({});
    
    // Insert categories
    console.log('Inserting service categories...');
    const categories = await ServiceCategory.insertMany(defaultCategories);
    console.log(`Created ${categories.length} service categories`);
    
    // Insert hair styles
    console.log('Inserting hair styles...');
    const hairStyles = await HairStyle.insertMany(defaultHairStyles);
    console.log(`Created ${hairStyles.length} hair styles`);
    
    // Insert available dates
    console.log('Generating and inserting available dates...');
    const availableDates = generateAvailableDates();
    const insertedDates = await AvailableDate.insertMany(availableDates);
    console.log(`Created ${insertedDates.length} available dates`);
    
    // Insert appointments
    console.log('Generating and inserting appointments...');
    const appointments = generateAppointments(availableDates, hairStyles, categories);
    const insertedAppointments = await Appointment.insertMany(appointments);
    console.log(`Created ${insertedAppointments.length} appointments`);
    
    // Seed SystemSettings
    console.log('Inserting SystemSettings...');
    const systemSettings = await SystemSettings.create({
      paymentRequired: true,
      paymentTimeoutMinutes: 10,
      defaultAppointmentStatus: 'pending',
      defaultPrice: 2
    });
    console.log('Created SystemSettings with default values');
    
    console.log('\n✅ Database seeded successfully!');
    console.log(`   - ${categories.length} service categories`);
    console.log(`   - ${hairStyles.length} hair styles`);
    console.log(`   - ${insertedDates.length} available dates`);
    console.log(`   - ${insertedAppointments.length} appointments`);
    console.log(`   - SystemSettings initialized\n`);
    
  } catch (error) {
    console.error('\n❌ Error seeding database:');
    console.error(error);
    
    if (error.name === 'MongoServerError') {
      console.error('\nMongoDB Server Error - Check your connection string and database permissions');
    } else if (error.name === 'MongooseError') {
      console.error('\nMongoose Error - Check your MongoDB connection string format');
    } else if (error.message && error.message.includes('MONGODB_URI')) {
      console.error('\nPlease ensure MONGODB_URI is set in your .env file');
    }
    
    process.exit(1);
  } finally {
    // Close connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the seed function
seedDatabase(); 