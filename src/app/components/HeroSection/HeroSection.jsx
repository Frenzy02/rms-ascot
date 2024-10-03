'use client'
import React, { useState } from 'react'
import Swal from 'sweetalert2'
import { WavyBackground } from './WavyBackground'
import Modal from './Modal'

const HeroSection = ({ isLoggedIn, userEmail, userId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const toggleModal = () => {
        if (!isLoggedIn) {
            Swal.fire({
                title: 'Login Required',
                text: 'You must be logged in to request a medical form.',
                icon: 'warning',
                confirmButtonText: 'OK'
            })
        } else {
            setIsModalOpen((prev) => !prev)
        }
    }

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
                <div className="relative inline-block group">
                    <button
                        onClick={toggleModal}
                        className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                        Upload Documents
                    </button>

                    <div className="tooltip absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-sm py-3 px-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Click to upload your documents
                    </div>
                </div>
            </div>

            {/* Render the Modal Component only if logged in */}
            {isLoggedIn && isModalOpen && (
                <Modal
                    toggleModal={toggleModal}
                    userEmail={userEmail}
                    userId={userId}
                />
            )}
        </WavyBackground>
    )
}

export default HeroSection
