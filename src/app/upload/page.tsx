"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabase"
import UploadForm from "@/app/components/UploadForm"
import Header from "@/app/components/Header"

export default function UploadPage() {
  const router = useRouter()

  const checkUser = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      router.push("/auth/login")
      return
    }
  }, [router])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  const handleSuccess = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        showBackButton={true} 
        backUrl="/dashboard" 
        title="Create New Listing"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Listing
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Upload a product photo and let AI generate compelling content for you. 
              Our advanced image analysis will create professional titles and descriptions in seconds.
            </p>
          </div>
          
          <UploadForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
