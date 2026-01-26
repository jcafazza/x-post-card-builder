'use client'

import { motion } from 'framer-motion'
import { forwardRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AnimatedHandMetalProps {
  size?: number
  className?: string
}

const AnimatedHandMetal = forwardRef<HTMLDivElement, AnimatedHandMetalProps>(
  ({ className, size = 28, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    
    return (
      <div
        ref={ref}
        className={className}
        {...props}
      >
        <motion.svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          style={{ originX: "50%", originY: "90%" }}
          animate={prefersReducedMotion ? {} : {
            rotate: [0, -15, 15, -10, 10, 0],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 0.8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.1
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18 12.5V10a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4" />
          <path d="M14 11V9a2 2 0 1 0-4 0v2" />
          <path d="M10 10.5V5a2 2 0 1 0-4 0v9" />
          <path d="m7 15-1.76-1.76a2 2 0 0 0-2.83 2.82l3.6 3.6C7.5 21.14 9.2 22 12 22h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v5" />
        </motion.svg>
      </div>
    )
  }
)

AnimatedHandMetal.displayName = 'AnimatedHandMetal'

export default AnimatedHandMetal
