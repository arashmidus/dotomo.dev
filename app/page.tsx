'use client'
import Image from 'next/image'
import { Canvas } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import Link from 'next/link'

function BackgroundShader() {
  const shaderRef = useRef()
  
  const uniforms = {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color(0.161, 0.020, 0.020) },
    uColorB: { value: new THREE.Color(0.016, 0.035, 0.153) },
    uResolution: { value: new THREE.Vector2() },
  }

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime * 0.3
    }
  })

  useEffect(() => {
    const handleResize = () => {
      if (shaderRef.current) {
        shaderRef.current.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      
      // Enhanced gradient with new colors
      float gradient = smoothstep(0.0, 1.0, uv.y);
      vec3 gradientColor = mix(uColorA, uColorB, gradient + sin(uTime * 0.2) * 0.1);
      
      // Add animated waves
      float waves = sin(uv.x * 6.0 + uTime) * sin(uv.y * 4.0 - uTime * 0.5) * 0.015;
      
      // Add subtle noise pattern
      float noisePattern = noise(uv * 2.0 + uTime * 0.1) * 0.02;
      
      // Animated glow points
      vec2 center1 = vec2(0.3 + sin(uTime * 0.5) * 0.1, 0.7 + cos(uTime * 0.3) * 0.1);
      vec2 center2 = vec2(0.7 + cos(uTime * 0.4) * 0.1, 0.3 + sin(uTime * 0.6) * 0.1);
      float glow1 = 0.02 / length(uv - center1) * 0.015;
      float glow2 = 0.02 / length(uv - center2) * 0.015;
      
      // Combine effects
      vec3 finalColor = gradientColor;
      finalColor += mix(uColorA, uColorB, 0.5) * waves;
      finalColor += mix(uColorA, uColorB, 0.3) * noisePattern;
      finalColor += vec3(0.3, 0.1, 0.1) * glow1; // Reddish glow
      finalColor += vec3(0.1, 0.1, 0.3) * glow2; // Bluish glow
      
      // Enhanced vignette
      float vignette = length(uv - 0.5) * 1.2;
      finalColor *= 1.0 - vignette * 0.7;
      
      // Subtle color correction
      finalColor = pow(finalColor, vec3(0.95));
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function IOSNotification({ className = "", title, message, time }: { 
  className?: string, 
  title: string, 
  message: string, 
  time: string 
}) {
  return (
    <div className={`relative group transform transition-all duration-300 ${className}`}>
      <div className="relative flex gap-4 p-4">
        <div className="relative w-10 h-10 rounded-[9px] overflow-hidden flex-shrink-0">
          <Image
            src="/icon.png"
            alt="Dotomo"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-0.5">
              <p className="text-white font-semibold text-[15px] leading-tight">{title}</p>
              <p className="text-white/80 text-[14px] leading-snug line-clamp-2">{message}</p>
            </div>
            <p className="text-white/50 text-xs flex-shrink-0 -mt-0.5">{time}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  
  const notifications = [
    {
      title: "Daily Task",
      message: "Submit expense report due today at 3 PM",
      time: "now"
    },
    {
      title: "Reminder",
      message: "Gather receipts and organize them",
      time: "2m ago"
    },
    {
      title: "Task Update",
      message: "2 steps completed, 1 remaining",
      time: "5m ago"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % notifications.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[10%] flex justify-center">
      <div className="relative h-[180px] w-[420px] sm:w-[440px] overflow-hidden mt-3">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className={`absolute inset-x-0 px-2 sm:px-0`}
            style={{
              opacity: index === activeIndex ? 1 : 0,
              transform: `translateY(${index === activeIndex ? '0' : '-24px'})`,
              zIndex: index === activeIndex ? 10 : 0,
              willChange: 'transform, opacity',
              transition: `
                opacity 400ms cubic-bezier(0.23, 1, 0.32, 1),
                transform 400ms cubic-bezier(0.175, 0.885, 0.32, 1.075)
              `
            }}
          >
            <div 
              style={{
                background: 'rgba(16, 16, 48, 0.4)',
                borderRadius: '16px',
                isolation: 'isolate',
                backdropFilter: 'blur(100px)',
                WebkitBackdropFilter: 'blur(100px)',
                transform: 'translate3d(0, 0, 0)',
                backfaceVisibility: 'hidden',
                perspective: '1000px',
                WebkitPerspective: '1000px',
                opacity: index === activeIndex ? 1 : 0.6,
                transition: 'opacity 800ms cubic-bezier(0.42, 0, 0.58, 1)'
              }}
            >
              <div className="absolute inset-0 backdrop-blur-[100px]" 
                style={{
                  background: 'rgba(41, 19, 39, 0.3)',
                  borderRadius: '16px',
                  WebkitBackdropFilter: 'blur(100px)',
                  backdropFilter: 'blur(100px)'
                }}
              />
              
              <div className="relative">
                <IOSNotification
                  className="transform transition-opacity duration-800"
                  title={notification.title}
                  message={notification.message}
                  time={notification.time}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FloatingNotification({ status, onClose }: { 
  status: 'success' | 'error', 
  onClose: () => void 
}) {
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      // Start exit animation
      setIsLeaving(true)
      // Wait for animation to complete before unmounting
      setTimeout(onClose, 500)
    }, 4500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-8 sm:top-8 sm:-mt-40 sm:-ml-20 left-1/2 -translate-x-1/2 z-50 w-[420px] sm:w-[540px] px-2 sm:px-0">
      <div 
        style={{
          background: 'rgba(16, 16, 48, 0.4)',
          borderRadius: '16px',
          isolation: 'isolate',
          backdropFilter: 'blur(100px)',
          WebkitBackdropFilter: 'blur(100px)',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          WebkitPerspective: '1000px',
        }}
        className={`
          animate-in fade-in slide-in-from-top-4 duration-500
          ${isLeaving ? 'animate-out fade-out slide-out-to-top-4 duration-500' : ''}
        `}
      >
        <div className="absolute inset-0 backdrop-blur-[100px]" 
          style={{
            background: 'rgba(41, 19, 39, 0.3)',
            borderRadius: '16px',
            WebkitBackdropFilter: 'blur(100px)',
            backdropFilter: 'blur(100px)'
          }}
        />
        
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[32px] rounded-[16px]" />
        
        <div className="relative p-4 flex items-center gap-4">
          <div className="relative w-10 h-10 rounded-[9px] overflow-hidden flex-shrink-0">
            <Image
              src="/icon.png"
              alt="Dotomo"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-0.5 text-left">
                <p className="text-white font-semibold text-[15px] leading-tight">
                  {status === 'success' ? 'Success' : 'Error'}
                </p>
                <p className="text-white/80 text-[14px] leading-snug line-clamp-2">
                  {status === 'success' 
                    ? "You've been added to the waitlist! We'll send you an invite once the app is approved."
                    : "Something went wrong. Please try again."}
                </p>
              </div>
              <p className="text-white/50 text-xs flex-shrink-0 -mt-0.5">now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SupportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, notes }),
      })

      if (!response.ok) throw new Error('Failed to submit')
      
      setSubmitStatus('success')
      setName('')
      setEmail('')
      setNotes('')
      setTimeout(() => {
        onClose()
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div 
        className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-300"
        style={{
          background: 'rgba(16, 16, 48, 0.4)',
          borderRadius: '16px',
          isolation: 'isolate',
          backdropFilter: 'blur(100px)',
          WebkitBackdropFilter: 'blur(100px)',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-[100px]" 
          style={{
            background: 'rgba(41, 19, 39, 0.3)',
            borderRadius: '16px',
            WebkitBackdropFilter: 'blur(100px)',
            backdropFilter: 'blur(100px)'
          }}
        />
        
        <div className="relative p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Support Request</h2>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full h-12 px-4 rounded-xl bg-white/10 backdrop-blur-sm 
                  text-white placeholder-white/50 outline-none focus:bg-white/15 
                  transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full h-12 px-4 rounded-xl bg-white/10 backdrop-blur-sm 
                  text-white placeholder-white/50 outline-none focus:bg-white/15 
                  transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How can we help?"
                required
                rows={4}
                className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm 
                  text-white placeholder-white/50 outline-none focus:bg-white/15 
                  transition-all duration-300 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-white/10 backdrop-blur-sm 
                hover:bg-white/20 transition-all duration-300 text-white font-medium
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : submitStatus === 'success' ? (
                'Submitted!'
              ) : submitStatus === 'error' ? (
                'Try Again'
              ) : (
                'Submit'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Navigation() {
  const [isSupportOpen, setIsSupportOpen] = useState(false)

  return (
    <>
      <nav className="flex gap-6">
        <Link href="https://www.privacypolicies.com/live/528cecef-dd3d-48d6-9a69-189b3875d717" className="text-white/60 hover:text-white transition-colors">
          Privacy
        </Link>
        <button 
          onClick={() => setIsSupportOpen(true)} 
          className="text-white/60 hover:text-white transition-colors"
        >
          Support
        </button>
      </nav>
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </>
  )
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/testflight-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) throw new Error('Failed to send invite')
      
      setSubmitStatus('success')
      setEmail('')
    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="h-screen relative overflow-hidden font-['SF_Pro_Display']">
      {/* Background shader */}
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 1] }} orthographic dpr={[1, 2]}>
          <BackgroundShader />
        </Canvas>
      </div>

      <div className="h-full flex flex-col">
        {/* Top Navigation */}
        <header className="flex justify-between items-center w-full max-w-5xl mx-auto px-12 sm:px-12 lg:px-6 py-4 mt-4">
          <div className="flex items-center gap-2">
            <Image
              src="/Group 3518721.png"
              alt="Dotomo Logo"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <Link href="/" className="text-white font-bold">
              DOTOMO
            </Link>
            <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/70 backdrop-blur-sm">
              BETA
            </span>
          </div>
          <Navigation />
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full relative z-10">
          {/* Left Column - Hero Text */}
          <div className="flex-1 space-y-6 md:space-y-8 px-8 md:px-12 lg:px-16 mt-12 sm:mt-12 text-center lg:text-left 
            lg:translate-x-[7%] relative z-10">
            <div className="space-y-6 sm:space-y-6">
              <h1 className="text-6xl md:text-6xl lg:text-7xl xl:text-[100px] font-bold leading-[0.9] tracking-tight text-white">
                Bedtime
                <br />
                Notes
                <br />
                Reminded
                <br />
                Tomorrow
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-4 w-full sm:w-auto">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={isSubmitting}
                        className="flex-1 sm:w-64 h-12 px-4 rounded-xl bg-white/10 backdrop-blur-sm 
                          text-white placeholder-white/50 outline-none focus:bg-white/15 
                          transition-all duration-300 disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="hidden sm:flex h-12 px-4 rounded-xl bg-white/10 backdrop-blur-sm 
                          hover:bg-white/20 transition-all duration-300 items-center justify-center
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                  {/* Floating notification */}
                  {submitStatus !== 'idle' && (
                    <FloatingNotification 
                      status={submitStatus} 
                      onClose={() => setSubmitStatus('idle')} 
                    />
                  )}
                  {/* Mobile App Store badge */}
                  <div className="block sm:hidden w-32">
                    <img
                      src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us"
                      alt="Download on the App Store"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - iPhone Screenshot */}
          <div className="flex-1 flex justify-center items-center w-full max-w-[100vw] lg:max-w-none mt-8 lg:mt-0 lg:px-16 
            relative lg:absolute lg:right-[0%] lg:top-[20%] lg:translate-x-[19%] z-0">
            <div className="relative w-full max-w-[420px] mx-auto px-4 lg:px-0">
              {/* Balanced Decorative Elements */}
              <div className="absolute -inset-4 bg-white/5 rounded-[44px] blur-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                w-[140%] h-[140%] bg-gradient-to-r from-white/8 to-transparent 
                rounded-full blur-2xl rotate-45" />
              
              {/* Refined Glow Effects */}
              <div className="absolute -inset-2 bg-white/5 rounded-[40px] blur-xl" />
              <div className="absolute -inset-1 bg-gradient-to-tr from-white/8 via-white/5 to-transparent rounded-[40px] blur-lg" />
              
              {/* iPhone Screenshot with Balanced Shadow */}
              <div className="relative aspect-[9/19.5] w-full 
                drop-shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]
                after:absolute after:inset-0 after:rounded-[44px] after:shadow-[inset_0_0_18px_rgba(255,255,255,0.07)]">
                <div className="absolute inset-0 rounded-[44px] overflow-hidden 
                  shadow-[0_0_20px_3px_rgba(255,255,255,0.07)]">
                  <Image
                    src="/IMG_F453735C462D-1 1.png"
                    alt="Dotomo App Screenshot"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                {/* Animated Notification Carousel */}
                <NotificationCarousel />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 md:px-12 lg:px-16 py-6 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
            <div className="text-white/30 text-sm order-2 md:order-1">
              © 2024 Dotomo. All rights reserved.
            </div>
            <div className="flex items-center gap-4 order-1 md:order-2">
              <div className="">
                <img
                  src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us"
                  alt="Download on the App Store"
                  className="w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
