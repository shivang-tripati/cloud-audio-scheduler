import Link from "next/link"
import { Radio } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card/40 backdrop-blur-md">
      <div className="container mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand section */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl transition-opacity hover:opacity-90">
              <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                <Radio className="h-5 w-5" />
              </div>
              <span className="text-red-500 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-500/60">
                RedioCast
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Professional centralized audio management system for retail branches.
              Schedule, synchronize, and monitor your music experience across all locations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">Admin Console</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">Download Agent</Link>
              </li>
              <li>
                {/* <Link href="#" className="hover:text-primary transition-colors">Documentation</Link> */}
              </li>
            </ul>
          </div>

          {/* Support */}
          {/* <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">Help Center</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">Branch Setup</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div> */}
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest">
          <p>© {new Date().getFullYear()} RedioCast. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Subtle bottom glow */}
      <div className="h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </footer>
  )
}
