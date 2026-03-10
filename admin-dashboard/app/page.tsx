import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Download, Radio, ShieldCheck, Music, SignalHigh } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden flex items-center py-16 lg:py-24">

            {/* Background Glow */}
            <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] opacity-20">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 blur-[120px] rounded-full" />
            </div>

            <div className="container relative z-10 mx-auto px-5">

                {/* HERO */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-500 backdrop-blur-sm">
                        <Radio className="h-4 w-4 animate-pulse" />
                        RKJ Retail Audio System
                    </div>

                    {/* Heading */}
                    <div className="space-y-5">
                        <h1 className="font-extrabold tracking-tight leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                            Welcome to{" "}
                            <span className="text-red-500 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-500/60">
                                RedioCast
                            </span>
                        </h1>

                        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
                            Radhakrishna Jewellery&apos;s centralized audio management system.
                            Schedule, synchronize and monitor music across all retail branches
                            from a single dashboard.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">

                        <Link href="/login" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto gap-2 h-12 px-8 shadow-lg hover:scale-[1.03] transition"
                            >
                                <ShieldCheck className="h-5 w-5" />
                                Login to Admin
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>

                        <Link href="#">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto gap-2 h-12 px-8 border-primary/20 bg-background/60 backdrop-blur hover:bg-primary/5 transition"
                            >
                                <Download className="h-5 w-5" />
                                Windows Agent
                            </Button>
                        </Link>

                    </div>
                </div>

                {/* FEATURES */}
                <div className="mt-20 lg:mt-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

                    {/* Feature 1 */}
                    <div className="group p-7 rounded-2xl border bg-card/40 hover:bg-card/70 transition backdrop-blur-md shadow-sm text-center">
                        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Music className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            Centralized Scheduling
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Control and dispatch music across all retail branches from one
                            unified dashboard.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="group p-7 rounded-2xl border bg-card/40 hover:bg-card/70 transition backdrop-blur-md shadow-sm text-center">
                        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <SignalHigh className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            Live Monitoring
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Monitor which branch is playing what in real time and maintain
                            consistent audio experience across locations.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="group p-7 rounded-2xl border bg-card/40 hover:bg-card/70 transition backdrop-blur-md shadow-sm text-center sm:col-span-2 lg:col-span-1">
                        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Download className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            Windows Audio Agent
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Lightweight Windows client that automatically syncs and plays
                            scheduled audio in the background.
                        </p>
                    </div>

                </div>

            </div>
        </div>
    )
}
