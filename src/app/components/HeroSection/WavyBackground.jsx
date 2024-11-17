'use client'

import { cn } from '@/lib/utils'
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'

// Use only the require statement for manual import
const SimplexNoise = require('simplex-noise')

export const WavyBackground = ({
    children,
    className,
    containerClassName,
    colors,
    waveWidth,
    backgroundFill,
    blur = 10,
    speed = 'fast',
    waveOpacity = 0.5,
    ...props
}) => {
    // Use useMemo to memoize the noise object
    const noise = useMemo(() => new SimplexNoise(), [])

    // Using useRef to preserve values across renders
    const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const wRef = useRef(0)
    const hRef = useRef(0)
    const ntRef = useRef(0)

    const getSpeed = useCallback(() => {
        switch (speed) {
            case 'slow':
                return 0.001
            case 'fast':
                return 0.002
            default:
                return 0.001
        }
    }, [speed]) // Added speed as a dependency

    const drawWave = useCallback(
        (n) => {
            ntRef.current += getSpeed()
            for (let i = 0; i < n; i++) {
                ctxRef.current.beginPath()
                ctxRef.current.lineWidth = waveWidth || 50
                ctxRef.current.strokeStyle = colors[i % colors.length]
                for (let x = 0; x < wRef.current; x += 5) {
                    const y =
                        noise.noise3D(x / 800, 0.3 * i, ntRef.current) * 100
                    ctxRef.current.lineTo(x, y + hRef.current * 0.5)
                }
                ctxRef.current.stroke()
                ctxRef.current.closePath()
            }
        },
        [colors, waveWidth, getSpeed, noise] // Added getSpeed and noise as dependencies
    )

    const render = useCallback(() => {
        const ctx = ctxRef.current
        ctx.fillStyle = backgroundFill || 'black'
        ctx.globalAlpha = waveOpacity || 0.5
        ctx.fillRect(0, 0, wRef.current, hRef.current)
        drawWave(5)
        requestAnimationFrame(render)
    }, [backgroundFill, waveOpacity, drawWave]) // Added dependencies

    const init = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctxRef.current = ctx
        wRef.current = ctx.canvas.width = window.innerWidth
        hRef.current = ctx.canvas.height = window.innerHeight
        ctx.filter = `blur(${blur}px)`
        ntRef.current = 0

        window.onresize = () => {
            wRef.current = ctx.canvas.width = window.innerWidth
            hRef.current = ctx.canvas.height = window.innerHeight
            ctx.filter = `blur(${blur}px)`
        }
        render()
    }, [blur, render]) // Added dependencies

    useEffect(() => {
        init()

        // Cleanup function
        return () => {
            cancelAnimationFrame(requestAnimationFrame(render))
        }
    }, [init, render]) // Added dependencies

    const [isSafari, setIsSafari] = useState(false)
    useEffect(() => {
        setIsSafari(
            typeof window !== 'undefined' &&
                navigator.userAgent.includes('Safari') &&
                !navigator.userAgent.includes('Chrome')
        )
    }, [])

    return (
        <div
            className={cn(
                'h-screen flex flex-col items-center justify-center',
                containerClassName
            )}>
            <canvas
                className="absolute inset-0 z-0"
                ref={canvasRef}
                id="canvas"
                style={{
                    ...(isSafari ? { filter: `blur(${blur}px)` } : {})
                }}></canvas>
            <div className={cn('relative z-10', className)} {...props}>
                {children}
            </div>
        </div>
    )
}
