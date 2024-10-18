'use client'
import { useState, useEffect, useRef } from 'react'
import jsQR from 'jsqr'

export default function QRCodeScanner() {
    const [scannedData, setScannedData] = useState(null)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [errorMessage, setErrorMessage] = useState(null)

    useEffect(() => {
        // Access the user's webcam
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'environment' } })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.setAttribute('playsinline', true) // Required for iOS to not fullscreen the video
                    videoRef.current.play()
                    scanQRCode()
                }
            })
            .catch((err) => {
                setErrorMessage('Error accessing camera: ' + err.message)
            })

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks()
                tracks.forEach((track) => track.stop()) // Stop the camera when component unmounts
            }
        }
    }, [])

    const scanQRCode = () => {
        const canvas = canvasRef.current
        const video = videoRef.current
        const context = canvas.getContext('2d')

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight
            canvas.width = video.videoWidth
            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            )
            const code = jsQR(imageData.data, canvas.width, canvas.height)

            if (code) {
                setScannedData(code.data) // Store the decoded QR data
            }
        }

        requestAnimationFrame(scanQRCode) // Keep scanning the video feed
    }

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold">Custom QR Code Scanner</h1>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {!scannedData ? (
                <>
                    <video ref={videoRef} className="w-full h-auto"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </>
            ) : (
                <p className="text-green-500">Scanned Data: {scannedData}</p>
            )}
        </div>
    )
}
