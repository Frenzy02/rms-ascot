'use client'
import { useRequireAuth } from '@/utils/auth'
import Link from 'next/link'
import {
    Popover,
    PopoverTrigger,
    PopoverContent
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select'

export default function Home() {
    useRequireAuth()
    return (
        <div
            className="flex flex-col min-h-screen"
            style={{ scrollBehavior: 'smooth' }}>
            <header className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="w-full h-screen object-cover" />
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="/frontpage.jpg"
                        width={1920}
                        height={1080}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-primary-foreground">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        Escape to Luxury
                    </h1>
                    <p className="mt-6 text-lg leading-8">
                        Experience the ultimate in relaxation and rejuvenation
                        at our premier resort.
                    </p>
                    <div className="mt-10">
                        <Link
                            href="#plan-your-getaway"
                            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            prefetch={false}>
                            Book Now
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <section className="bg-background py-12 sm:py-16 lg:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                            <div className="group relative">
                                <div className="h-[300px] w-full overflow-hidden rounded-lg bg-gray-200">
                                    <img
                                        src="/luxury.jpeg"
                                        alt="Luxury Accommodation"
                                        width={600}
                                        height={400}
                                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-foreground">
                                        Luxury Accommodation
                                    </h3>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Experience the ultimate in comfort and
                                    elegance in our beautifully appointed suites
                                    and villas.
                                </p>
                                <Link
                                    href="#"
                                    className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    prefetch={false}>
                                    Luxury Accommodation
                                </Link>
                            </div>
                            <div className="group relative">
                                <div className="h-[300px] w-full overflow-hidden rounded-lg bg-gray-200">
                                    <img
                                        src="/spa.jpg"
                                        alt="Spa Services"
                                        width={600}
                                        height={400}
                                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-foreground">
                                        Spa Services
                                    </h3>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Rejuvenate your mind, body, and soul with
                                    our world-class spa treatments and wellness
                                    offerings.
                                </p>
                                <Link
                                    href="#"
                                    className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    prefetch={false}>
                                    Spa Services
                                </Link>
                            </div>
                            <div className="group relative">
                                <div className="h-[300px] w-full overflow-hidden rounded-lg bg-gray-200">
                                    <img
                                        src="/dining.jpg"
                                        alt="Dining Experiences"
                                        width={600}
                                        height={400}
                                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-foreground">
                                        Dining Experiences
                                    </h3>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Indulge in our award-winning cuisine,
                                    featuring locally sourced ingredients and
                                    innovative culinary creations.
                                </p>
                                <Link
                                    href="#"
                                    className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    prefetch={false}>
                                    Dining Experiences
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-12 md:py-20 lg:py-24 bg-muted">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                            <div className="group relative">
                                <div className="h-[300px] w-full overflow-hidden rounded-lg bg-gray-200">
                                    <img
                                        src="/outdoor.jpg"
                                        alt="Outdoor Activities"
                                        width={600}
                                        height={400}
                                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-foreground">
                                        Outdoor Activities
                                    </h3>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Explore our stunning natural surroundings
                                    with a variety of outdoor activities, from
                                    hiking to water sports.
                                </p>
                                <Link
                                    href="#"
                                    className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    prefetch={false}>
                                    Outdoor Activities
                                </Link>
                            </div>
                            <div className="group relative">
                                <div className="h-[300px] w-full overflow-hidden rounded-lg bg-gray-200">
                                    <img
                                        src="/event.jpg"
                                        alt="Event Spaces"
                                        width={600}
                                        height={400}
                                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-foreground">
                                        Event Spaces
                                    </h3>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Host your next special event or corporate
                                    gathering in our elegant and versatile event
                                    spaces.
                                </p>
                                <Link
                                    href="#"
                                    className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    prefetch={false}>
                                    Event Spaces
                                </Link>
                            </div>
                            <div className="group relative">
                                <div className="h-[300px] w-full overflow-hidden rounded-lg bg-gray-200">
                                    <img
                                        src="/concierge.jpg"
                                        alt="Concierge Services"
                                        width={600}
                                        height={400}
                                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-foreground">
                                        Concierge Services
                                    </h3>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Let our dedicated concierge team handle all
                                    the details to ensure your stay is truly
                                    unforgettable.
                                </p>
                                <Link
                                    href="#"
                                    className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    prefetch={false}>
                                    Contact Concierge
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                <section
                    id="plan-your-getaway"
                    className="py-12 md:py-20 lg:py-24">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-8 md:grid-cols-2">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                    Plan Your Getaway
                                </h2>
                                <p className="mt-4 text-muted-foreground">
                                    Book your stay at our luxurious resort and
                                    experience the ultimate in relaxation and
                                    rejuvenation.
                                </p>
                                <form className="mt-6 grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="check-in"
                                                className="block text-sm font-medium text-foreground">
                                                Check-in
                                            </label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="mt-1 w-full rounded-md border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                                        <span>Select date</span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0">
                                                    <Calendar />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="check-out"
                                                className="block text-sm font-medium text-foreground">
                                                Check-out
                                            </label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="mt-1 w-full rounded-md border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                                        <span>Select date</span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0">
                                                    <Calendar />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="guests"
                                            className="block text-sm font-medium text-foreground">
                                            Guests
                                        </label>
                                        <Select>
                                            <SelectTrigger className="mt-1 w-full rounded-md border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                                <SelectValue placeholder="Select guests" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">
                                                    1 guest
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    2 guests
                                                </SelectItem>
                                                <SelectItem value="3">
                                                    3 guests
                                                </SelectItem>
                                                <SelectItem value="4">
                                                    4 guests
                                                </SelectItem>
                                                <SelectItem value="5">
                                                    5+ guests
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                        Check Availability
                                    </Button>
                                </form>
                            </div>
                            <div>
                                <img
                                    src="/booking.jpg"
                                    width={800}
                                    height={600}
                                    alt="Resort Booking"
                                    className="rounded-lg object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
