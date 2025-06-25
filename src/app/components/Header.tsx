"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, ArrowLeft, Home } from "lucide-react"
import { supabase } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"

interface HeaderProps {
  showBackButton?: boolean
  backUrl?: string
  title?: string
  showLogout?: boolean
  showHomeButton?: boolean
}

export default function Header({ 
  showBackButton = false, 
  backUrl = "/dashboard", 
  title = "Smart List",
  showLogout = true,
  showHomeButton = false
}: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleBack = () => {
    router.push(backUrl)
  }

  const handleHome = () => {
    router.push("/")
  }

  return (
    <header className="sticky top-0 right-0 left-0 bg-white dark:bg-gray-800 z-50 border-b border-gray-200 dark:border-gray-700">
      <nav className="container mx-auto py-3 md:py-2 relative">
        <div className="flex flex-row items-center justify-between px-4 md:px-0">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {showHomeButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHome}
                className="text-gray-600 dark:text-gray-300"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            )}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Smart List Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                {title}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {showLogout && (
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 dark:text-gray-300"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
} 