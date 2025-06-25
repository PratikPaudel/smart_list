"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/app/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ProductListing } from "@/app/types"

export default function ListingDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [listing, setListing] = useState<ProductListing | null>(null)

  useEffect(() => {
    if (id) fetchListing()
    // eslint-disable-next-line
  }, [id])

  const fetchListing = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error("Please sign in to view listings")
        router.push("/auth/login")
        return
      }
      const res = await fetch(`/api/listings/${id}`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      })
      if (!res.ok) {
        toast.error("Listing not found or access denied")
        router.push("/dashboard")
        return
      }
      const { listing } = await res.json()
      setListing(listing)
    } catch {
      toast.error("Error loading listing")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Listing not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{listing.title}</CardTitle>
            <CardDescription>Created {new Date(listing.created_at).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {listing.image_url && (
              <Image 
                src={listing.image_url} 
                alt={listing.title} 
                width={400}
                height={256}
                className="w-full h-64 object-cover rounded" 
              />
            )}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{listing.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/listings/${id}/edit`)}>
                Edit Listing
              </Button>
              <Button variant="secondary" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 