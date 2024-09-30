'use client'
import React from 'react'
import { WavyBackground } from './WavyBackground'

const HeroSection = ({ isLoggedIn, userEmail, userId }) => {
    return (
        <WavyBackground
            className="flex items-center justify-center text-center"
            containerClassName="relative h-screen"
            colors={['#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#22d3ee']}
            waveWidth={50}
            backgroundFill="#111827"
            blur={10}
            speed="fast"
            waveOpacity={0.5}>
            <div className="hero-content max-w-xl relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Welcome to ASCOT RMS
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-6">
                    The all-in-one solution for efficient, secure, and compliant
                    record management.
                </p>
            </div>
        </WavyBackground>
    )
}

export default HeroSection
