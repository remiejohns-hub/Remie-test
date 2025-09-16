"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Back to Site */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              aria-label="POS Digital home" 
              title="POS Digital - Home" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-lg bg-[#0066cc] flex items-center justify-center">
                <span className="text-white font-serif font-black text-lg">P</span>
              </div>
              <span className="font-serif font-black text-xl text-foreground">POS Digital</span>
            </Link>
            
            <div className="hidden md:block h-6 w-px bg-border" />
            
            <Button variant="ghost" size="sm" className="shadow-sm hover:shadow-md transition-shadow" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Site
              </Link>
            </Button>
          </div>

          {/* Admin Badge */}
          <div className="flex items-center">
            <div className="px-3 py-1 bg-[#0066cc]/10 text-[#0066cc] rounded-full text-sm font-medium">
              Admin Panel
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
