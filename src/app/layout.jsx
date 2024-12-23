import 'react-toastify/dist/ReactToastify.css'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { ToastContainer } from 'react-toastify'
import Header from '@/navigations/Header'
import Footer from '@/navigations/Footer'

const montserrat = Montserrat({
    subsets: ['latin']
})

export const metadata = {
    title: 'ASCOT RMS',
    description: 'Generated by create next app'
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className={montserrat.className}>
                <ToastContainer />
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    )
}
