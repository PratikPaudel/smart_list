"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabase"
import UploadForm from "@/app/components/UploadForm"

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Listing
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload a product photo and let AI generate compelling content for you
            </p>
          </div>
          
          <UploadForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
