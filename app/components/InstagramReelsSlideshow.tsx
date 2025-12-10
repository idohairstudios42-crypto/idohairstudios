'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Instagram } from 'lucide-react'

// Instagram reel URLs - easily configurable
const INSTAGRAM_REELS = [
  'https://www.instagram.com/reel/DR7HTFNDJnv',
  'https://www.instagram.com/reel/DRhOaG7iOA2',
  'https://www.instagram.com/reel/DRSdq67iLuv',
  'https://www.instagram.com/reel/DQziHMLiIu-',
]

// Extract reel ID from URL for embed
const getReelEmbedUrl = (url: string) => {
  const reelId = url.split('/reel/')[1]?.replace('/', '')
  return `https://www.instagram.com/reel/${reelId}/embed`
}

// Professional slide animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.3 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    },
  }),
}

// Swipe confidence threshold
const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

interface InstagramReelsSlideshowProps {
  autoAdvanceInterval?: number
}

export default function InstagramReelsSlideshow({
  autoAdvanceInterval = 8000
}: InstagramReelsSlideshowProps) {
  const [[currentIndex, direction], setPage] = useState([0, 0])
  const [isPaused, setIsPaused] = useState(false)

  const paginate = useCallback((newDirection: number) => {
    const newIndex = currentIndex + newDirection
    if (newIndex < 0) {
      setPage([INSTAGRAM_REELS.length - 1, newDirection])
    } else if (newIndex >= INSTAGRAM_REELS.length) {
      setPage([0, newDirection])
    } else {
      setPage([newIndex, newDirection])
    }
  }, [currentIndex])

  const goToSlide = useCallback((index: number) => {
    const newDirection = index > currentIndex ? 1 : -1
    setPage([index, newDirection])
  }, [currentIndex])

  // Handle drag end - swipe detection
  const handleDragEnd = useCallback((
    _event: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo
  ) => {
    const swipe = swipePower(offset.x, velocity.x)

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1) // Swipe left - go to next
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1) // Swipe right - go to previous
    }
  }, [paginate])

  // Auto-advance functionality
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => paginate(1), autoAdvanceInterval)
    return () => clearInterval(interval)
  }, [isPaused, autoAdvanceInterval, paginate])

  return (
    <motion.div
      className="w-full py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Instagram size={18} className="text-white/70" />
          <h2 className="font-montserrat font-bold text-lg uppercase tracking-wider text-white">
            Our Work
          </h2>
        </div>
        <p className="text-xs text-white/60">
          See our latest transformations • Swipe to explore
        </p>
      </div>

      {/* Slideshow Container with swipe support */}
      <div className="relative max-w-md mx-auto overflow-hidden">
        <motion.div
          className="bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden"
          whileHover={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}
          transition={{ duration: 0.3 }}
        >
          {/* Instagram Embed - clickable */}
          <div className="relative w-full" style={{ paddingBottom: '125%' }}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                <iframe
                  src={getReelEmbedUrl(INSTAGRAM_REELS[currentIndex])}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  scrolling="no"
                  allowFullScreen
                />
              </motion.div>
            </AnimatePresence>

            {/* Edge swipe zones - only on left/right edges, don't block center */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-12 z-10 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
            />
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-12 z-10 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
            />
          </div>
        </motion.div>

        {/* Swipe indicator arrows (subtle) */}
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none opacity-30">
          <motion.div
            animate={{ x: [-3, 0, -3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-white text-2xl"
          >
            ‹
          </motion.div>
        </div>
        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none opacity-30">
          <motion.div
            animate={{ x: [3, 0, 3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-white text-2xl"
          >
            ›
          </motion.div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {INSTAGRAM_REELS.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                ? 'bg-white w-6'
                : 'bg-white/30 hover:bg-white/50 w-2'
                }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Instagram CTA */}
      <motion.a
        href="https://www.instagram.com/idohairstudios/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 mt-4 text-xs text-white/60 hover:text-white transition-colors duration-300"
        whileHover={{ scale: 1.02 }}
      >
        <Instagram size={14} />
        <span>Follow us for more</span>
      </motion.a>
    </motion.div>
  )
}
