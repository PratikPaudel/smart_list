"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Upload, 
  Sparkles, 
  Zap, 
  ArrowRight,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDashboard = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <header className="sticky top-0 right-0 left-0 md:top-0 bg-white dark:bg-gray-900 z-50 border-b border-gray-100 dark:border-gray-800">
        <nav className="container mx-auto py-3 md:py-2 relative">
          <div className="flex flex-row items-center justify-between px-4 md:px-0">
            <div className="">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Smart List Logo"
                  width={42}
                  height={42}
                  className="h-10 w-10"
                />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <ul className="flex-row items-center gap-6 hidden md:flex">
                <li><a href="#home" className="text-sm text-blue-600 dark:text-blue-400 ease-out duration-200">Home</a></li>
                <li><a href="#features" className="text-sm text-blue-600 dark:text-blue-400 ease-out duration-200">Features</a></li>
                {user ? (
                  <>
                    <li>
                      <Button 
                        onClick={handleDashboard}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                      >
                        Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </li>
                    <li>
                      <Button 
                        onClick={handleLogout}
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-600 dark:text-gray-300"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link href="/auth/register">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2">
                        Join Now <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </li>
                )}
              </ul>
              
              <ThemeToggle />

              <div className="inline-block md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`absolute bg-white dark:bg-gray-900 w-full pb-4 ${mobileMenuOpen ? 'block' : 'hidden'} top-0 right-0 border-b border-gray-100 dark:border-gray-800`}>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 mr-4"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ul className="flex flex-col items-center gap-4">
              <li><a href="#home" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 ease-out duration-200">Home</a></li>
              <li><a href="#features" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 ease-out duration-200">Features</a></li>
              {user ? (
                <>
                  <li>
                    <Button 
                      onClick={handleDashboard}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                    >
                      Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </li>
                  <li>
                    <Button 
                      onClick={handleLogout}
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 dark:text-gray-300"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/auth/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2">
                      Join Now <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </header>

      {/* Main Section */}
      <main>
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto px-6 md:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
              {/* Text Content */}
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                    Create listings faster, <br/>
                    <span className="text-blue-600 dark:text-blue-400">sell more products</span>
                  </h1>
                  <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                    {user 
                      ? "Welcome back! Ready to create more amazing product listings? Upload a photo and let AI generate compelling content for you."
                      : "Join 10,000+ sellers using AI to generate professional product listings in seconds. Upload a photo, get a complete listing ready to sell."
                    }
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {user ? (
                    <Button 
                      onClick={handleDashboard}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base"
                    >
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Link href="/auth/register">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base">
                        Start Your Journey
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* GIF Section */}
              <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                <div className="w-full max-w-xl relative">
                  {/* Backdrop shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-3xl transform scale-110"></div>
                  
                  {/* GIF with shadow */}
                  <div className="relative">
                    <Image 
                      src="/smart_list.gif" 
                      alt="Smart List Demo" 
                      width={600} 
                      height={450} 
                      className="w-full h-auto rounded-xl shadow-2xl shadow-blue-500/25 dark:shadow-blue-400/20"
                      priority
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center mt-12 space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 opacity-20"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Everything you need to create winning listings
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                From AI-powered content to professional optimization
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex flex-col gap-6 rounded-xl py-6 border border-gray-200 dark:border-gray-700 shadow-none hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-center px-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Smart Upload</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Upload any product photo and let our AI analyze it to understand what you&apos;re selling
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex flex-col gap-6 rounded-xl py-6 border border-gray-200 dark:border-gray-700 shadow-none hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-center px-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">AI Generation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Get professional titles and descriptions optimized for conversions and SEO
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex flex-col gap-6 rounded-xl py-6 border border-gray-200 dark:border-gray-700 shadow-none hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-center px-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Lightning Fast</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Generate complete listings in under 10 seconds, ready to publish anywhere
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-12 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-6 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logo.png"
                    alt="Smart List Logo"
                    width={42}
                    height={42}
                    className="h-10 w-10"
                  /> 
                  <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">Smart List</span>
                </Link>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  © 2024 Smart List. All rights reserved.
                </p>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Privacy</a>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Terms</a>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Contact</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}