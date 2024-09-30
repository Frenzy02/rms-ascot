'use client'
import React, { useState, useEffect } from 'react'
import Features from './components/Features/page'
import HeroSection from './components/HeroSection/page'
import { useAuthUserStore } from '@/store/user'

export default function Page() {
    const isLoggedIn = useAuthUserStore((state) => state.isLoggedIn) // Get logged-in status from the store

    useEffect(() => {
        const handleScrollAnimation = () => {
            const elements = document.querySelectorAll('.scroll-animation')
            elements.forEach((element) => {
                const rect = element.getBoundingClientRect()
                const isVisible =
                    rect.top < window.innerHeight && rect.bottom >= 0
                if (isVisible) {
                    element.classList.add('visible')
                } else {
                    element.classList.remove('visible')
                }
            })
        }

        window.addEventListener('scroll', handleScrollAnimation)
        handleScrollAnimation() // Trigger on mount to handle initial state

        return () => window.removeEventListener('scroll', handleScrollAnimation)
    }, [])

    return (
        <div>
            <section id="home" className="scroll-animation">
                <HeroSection isLoggedIn={isLoggedIn} />
            </section>
            <section id="features" className="scroll-animation">
                <Features />
            </section>
        </div>
    )
}
