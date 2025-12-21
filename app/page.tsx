'use client'

import Image from 'next/image'
import AppointmentForm from './components/AppointmentForm'
import { useState, useMemo, useCallback } from 'react'
import { Phone, Mail, Heart, Sparkles, CalendarDays, Star, Instagram, MessageCircle, Video } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import TrendingStyles from './components/TrendingStyles'

export default function Home() {
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Memoize variants to prevent recreation on every render
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }), [])

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }), [])

  // Memoize sparkle animation variants
  const sparkleVariants = useMemo(() => ({
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0, 1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "loop" as const,
      }
    }
  }), []) as Variants

  // Optimize image loading
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-black text-white bg-glossy overflow-x-hidden">
      {/* Font imports for Noto Serif Display */}
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Display:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
          `
        }}
      />

      {/* Hero Header Section */}
      <header className="relative w-full min-h-[70vh] flex items-center justify-center">
        {/* Background Image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/profile_image2.png"
            alt="I DO HAIR STUDIOS Background"
            fill
            className="object-cover object-center"
            priority
            onLoad={handleImageLoad}
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>

        {/* Grouped Text + Logo positioned at bottom */}
        <div className="absolute bottom-[10px] w-full flex flex-col items-center justify-center text-center px-7 z-10">
          <motion.p
            className="tagline text-sm mb-2 text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1.1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            EMPOWERING YOUR UNIQUE BEAUTY
          </motion.p>
          <motion.div
            className="w-40 sm:w-48 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Image
              src="/images/logo2.png"
              alt="I DO HAIR STUDIOS Logo"
              width={340}
              height={220}
              className="w-full h-auto"
              priority
            />
          </motion.div>
        </div>

        {/* Optional: subtle decorative elements */}
        <motion.div
          className="absolute top-5 right-4 text-white/30 z-10"
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
        >
          <Sparkles size={18} />
        </motion.div>
        <motion.div
          className="absolute bottom-8 left-8 text-white/30 z-10"
          variants={sparkleVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1 }}
        >
          <Sparkles size={12} />
        </motion.div>
      </header>

      {/* Trending Styles Section - replaces Instagram Reels */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <TrendingStyles />
      </div>

      {/* Responsive container for the rest of the content */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Mid section with profile image and text - since hero now has the profile image background, we don't need this part */}
        <div className="mt-10 mb-8">
          {/* Experience section */}
          <motion.div
            className="text-center flex-1 mt-4 sm:mt-0"
            variants={itemVariants}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <h2 className="font-montserrat text-2xl sm:text-3xl mb-2 font-semibold text-white tracking-wide">Empowering Your Unique Beauty</h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-white/70 mb-3 leading-relaxed">
              Thank you for choosing I DO HAIR STUDIOS. Your trust and loyalty mean the world to me.
            </p>
            <div className="flex items-center justify-center">
              <p className="script-font text-xl font-light">-Vanessa</p>
              <motion.span
                className="ml-1 text-white/50 cursor-pointer hover:text-white transition-colors duration-200"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                onClick={() => window.location.href = '/admin'}
              >
                <Heart size={12} fill="currentColor" />
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Main content section */}
        <motion.section
          className="flex-1 flex flex-col px-4 sm:px-6 serif-font overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Contact information - moved up for better visibility */}
          <motion.div
            className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-8"
            variants={itemVariants}
          >
            <a href="tel:+233548947612" className="flex items-center text-white/70 hover:text-white transition-colors duration-300 text-[10px] sm:text-xs">
              <Phone size={12} className="mr-1" />
              +233 54 894 7612
            </a>
            <a href="mailto:idohairstudios42@gmail.com" className="flex items-center text-white/70 hover:text-white transition-colors duration-300 text-[10px] sm:text-xs">
              <Mail size={16} className="mr-2 text-pink-500" />
              idohairstudios42@gmail.com
            </a>
          </motion.div>

          {/* About and Services in a two-column layout on larger screens */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 font-lato max-w-5xl mx-auto"
            variants={itemVariants}
          >
            {/* About Card */}
            <motion.div
              className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
              whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="font-montserrat font-bold text-base uppercase mb-3 tracking-wider text-white">About</h3>
              <div className="h-px bg-white/10 mb-4" />
              <p className="text-sm text-white/80 leading-relaxed">
                At I DO HAIR STUDIOS, we merge artistry with problem-solving to give you hair solutions that last. From wigs that fit perfectly, to braids that stay neat for weeks, to installs that look natural — we engineer confidence through every strand.
              </p>
              <div className="flex items-center gap-4 mt-4 text-white text-xs font-montserrat">
                <span className="flex items-center gap-1"><span className="text-white">🔧</span> Precision.</span>
                <span className="flex items-center gap-1"><span className="text-white">✨</span> Creativity.</span>
                <span className="flex items-center gap-1"><span className="text-white">💕</span> Confidence.</span>
              </div>
            </motion.div>

            {/* Services Card */}
            <motion.div
              className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
              whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="font-montserrat font-bold text-base uppercase mb-3 tracking-wider text-white">Services</h3>
              <div className="h-px bg-white/10 mb-4" />
              <ul className="text-sm text-white/80 leading-relaxed list-disc pl-5 space-y-2 mb-4">
                <li>Braids, Locs & Twists – Knotless, box braids, passion twists, butterfly locs, faux locs, soft locs, distressed locs, natural twists, stitch braids, & more.</li>
                <li>Wig Making – Custom units engineered for perfect fit & longevity.</li>
                <li>Wig Installations – Closure, frontal & Lagos hairline installs with natural finishes.</li>
                <li>Ponytails – Sleek, braided & natural ponytail styles.</li>
                <li>Revamps & Treatments – Deep wash, protein therapy & full wig restoration.</li>
                <li>Customization & Styling – Bleaching, plucking, tinting, curls, crimps, trims & silk finishes.</li>
                <li>Bridal Hairstyling – Elegant, bespoke bridal looks for your big day.</li>
                <li>Lagos Hairline – Sleek, trendy & precision-engineered hairlines.</li>
                <li>Destination Hairstyling – Get styled wherever you are, travel-inclusive packages.</li>
                <li>Beginner & Master Classes – Learn braids, wig-making & installs directly from I DO HAIR STUDIOS.</li>
                <li>Luxury Hair Collection – Curated premium hair extensions for a flawless finish.</li>
              </ul>
              <motion.a
                href="/book"
                className="w-full py-2.5 text-center border border-white/30 bg-white/10 hover:bg-white/20 uppercase tracking-widest text-xs text-white hover:text-white transition-all duration-300 rounded-sm block"
                whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.98 }}
              >
                Book Now
              </motion.a>
            </motion.div>

          </motion.div>

          {/* Education Card - Full width below About/Services */}
          <motion.div
            className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-white/20 hover:border-white/40 transition-all duration-300 mb-10 font-lato max-w-4xl mx-auto"
            variants={itemVariants}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="font-montserrat font-bold text-base uppercase mb-3 tracking-wider text-white">Education</h3>
            <div className="h-px bg-white/10 mb-4" />
            <p className="text-sm text-white/80 mb-2">🎓 We don't just style, we teach.</p>
            <ul className="text-sm text-white/80 leading-relaxed list-disc pl-5 space-y-2">
              <li>Beginner Classes – Learn braiding basics, wig-making foundation, and simple installs. Perfect for starters.</li>
              <li>Masterclasses – Advanced wig construction, precision lace installs, Lagos hairline techniques, business growth in hairstyling.</li>
            </ul>
            <p className="text-xs text-white/60 mt-2">💡 Both online & in-person options.</p>
            <a
              href="https://wa.me/233548947612?text=Heyy%20🌸%20I%20want%20to%20join%20your%20masterclass!%20I'm%20ready%20to%20level%20up%20my%20hairstyling%20skills%20✨%20Please%20tell%20me%20more%20about%20the%20courses%20available%20💕"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full mt-4 px-4 py-2 bg-white text-black hover:bg-white/90 text-sm font-medium rounded-md transition-all duration-300 shadow-lg hover:shadow-xl border border-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-2"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              Sign Up for Classes 🎓
            </a>
          </motion.div>

          {/* Testimonials - moved before booking policies */}
          <motion.div
            className="mb-10 font-lato"
            variants={itemVariants}
          >
            <h2 className="text-center text-xl mb-6 font-montserrat font-bold text-white">Testimonials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-black/60 border border-white/20 rounded-md p-4">
                <p className="text-white mb-1">⭐️⭐️⭐️⭐️⭐️</p>
                <p className="text-sm text-white/80">"My braids lasted 6 weeks and still looked neat. The best grip I've ever had." – Abena M.</p>
              </div>
              <div className="bg-black/60 border border-white/20 rounded-md p-4">
                <p className="text-white mb-1">⭐️⭐️⭐️⭐️⭐️</p>
                <p className="text-sm text-white/80">"The Lagos hairline install made my wig look like my real hair. Confidence 100%." – Serwaa O.</p>
              </div>
            </div>
          </motion.div>

          {/* Booking CTA lead-in */}
          <motion.p
            className="text-sm text-white/80 mb-4 leading-relaxed text-center font-lato"
            variants={itemVariants}
          >
            Ready to experience beauty engineered with precision?
          </motion.p>

          {/* NEW: Booking policies with updated card layout */}
          <motion.div
            className="mb-10 font-lato"
            variants={itemVariants}
          >
            <h2 className="text-center text-xl mb-2 font-montserrat font-bold text-white">Booking Policies</h2>
            <p className="text-center text-sm text-white/70 mb-4 max-w-3xl mx-auto px-2">
              To give every client the best possible experience, please take note of our service policies:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* PAYMENT */}
              <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-montserrat font-bold text-sm uppercase mb-2 tracking-wider text-white">PAYMENT</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  A non-refundable deposit is required to book your slot. Remaining balance must be paid in cash or MoMo at the time of service.
                </p>
              </motion.div>

              {/* LATENESS */}
              <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-montserrat font-bold text-sm uppercase mb-2 tracking-wider text-white">LATENESS</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Please arrive on time. A 30-minute grace period is allowed. After 45 minutes, your appointment may be cancelled or rescheduled depending on availability.
                </p>
              </motion.div>

              {/* RESCHEDULES */}
              <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-montserrat font-bold text-sm uppercase mb-2 tracking-wider text-white">RESCHEDULES</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  You may reschedule once, at least 24 hours in advance. Rescheduling within 24 hours may require a new deposit.
                </p>
              </motion.div>

              {/* PREP */}
              {/* <motion.div 
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-montserrat font-bold text-sm uppercase mb-2 tracking-wider text-white">PREP</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Hair must be clean, detangled, well blow-dried and free of product build-up.
                </p>
              </motion.div> */}

              {/* NO REFUNDS */}
              <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-montserrat font-bold text-sm uppercase mb-2 tracking-wider text-white">NO REFUNDS</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  All deposits and payments are final. If unsatisfied, kindly raise concerns during the appointment so we can make adjustments.
                </p>
              </motion.div>

              {/* CANCELLATIONS */}
              <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-montserrat font-bold text-sm uppercase mb-2 tracking-wider text-white">CANCELLATIONS</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Cancellations must be made 24 hours in advance. Last-minute cancellations result in loss of deposit.
                </p>
              </motion.div>

              {/* REVAMPS */}
              <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-montserrat font-bold text-sm uppercase mb-2 tracking-wider text-white">REVAMPS</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Processing takes 3–5 working days. Drop-offs after 3PM count as next-day processing.
                </p>
              </motion.div>

              {/* INSTALLATIONS */}
              <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-montserrat font-bold text-sm uppercase mb-2 tracking-wider text-white">INSTALLATIONS</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Please drop off your unit 1–2 days before your appointment to allow for prep.
                </p>
              </motion.div>

              {/* PONYTAILS */}
              <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-montserrat font-bold text-sm uppercase mb-2 tracking-wider text-white">PONYTAILS</h3>
                <ul className="text-sm text-white/80 leading-relaxed list-disc pl-5">
                  <li>For ponytail styles, hair must be freshly washed, detangled, and product-free.</li>
                  <li>Minimum hair length required is 6 inches—shorter lengths should book a consultation.</li>
                  <li>Styling products are provided; bring your own if you have sensitivities or preferences.</li>
                </ul>
              </motion.div>

              {/* WIG MAKING */}
              <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-montserrat font-bold text-sm uppercase mb-2 tracking-wider text-white">WIG MAKING</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Custom units take 5–7 working days to complete.
                </p>
              </motion.div>

              {/* ADDITIONAL SERVICES */}
              <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)" }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-montserrat font-bold text-sm uppercase mb-2 tracking-wider text-white">ADDITIONAL SERVICES</h3>
                <ul className="text-sm text-white/80 leading-relaxed list-disc pl-5">
                  <li>Plucking & Knot Bleaching: Extra</li>
                  <li>All add-ons must be selected at booking.</li>
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* Conditional Scroll indicator that appears after clicking Book button */}
          {acceptedTerms && (
            <motion.div
              className="w-full flex flex-col items-center justify-center mb-8 animate-bounce-slow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-white/70 text-xs mb-2">Scroll down to book your appointment</p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/70"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </motion.div>
          )}
        </motion.section>
      </div>

      {/* New Footer Section */}
      <footer className="w-full bg-black mt-20 pt-12 pb-6 border-t border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-white font-['Noto_Serif_Display'] text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">About Us</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Training Courses</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Luxury Hair Extensions</a></li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-white font-['Noto_Serif_Display'] text-lg font-semibold mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Client Reviews</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">FAQ</a></li>
              </ul>
            </div>

            {/* Connect With Us */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center lg:px-8">
              <h3 className="text-white font-['Noto_Serif_Display'] text-lg font-semibold mb-4">Connect With Us</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors text-sm flex items-center">
                    <Instagram size={16} className="mr-2" />
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors text-sm flex items-center">
                    <Video size={16} className="mr-2" />
                    <span>TikTok</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors text-sm flex items-center">
                    <MessageCircle size={16} className="mr-2" />
                    <span>WhatsApp</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright and Creator Credit */}
          <div className="mt-12 pt-6 border-t border-white/20 text-center">
            <p className="text-white/70 text-sm mb-2">© 2025 I DO HAIR STUDIOS. All Rights Reserved.</p>
            <p className="text-white/60 text-xs">Created by Dong Tech. Contact us on +233 2041 63714 to build your dream business together.</p>
          </div>
        </div>
      </footer>
    </div >
  )
}

