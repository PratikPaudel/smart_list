"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/app/lib/supabase"
import { ProductListing } from "@/app/types"
import { Plus, Search, LogOut, Edit3, Eye, Calendar } from "lucide-react"
import { toast } from "sonner"

export default function DashboardPage() {
  const [listings, setListings] = useState<ProductListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const checkUser = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      router.push("/auth/login")
      return
    }
  }, [router])

  const fetchListings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("product_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching listings:", error)
        toast.error("Failed to load listings")
        return
      }

      // Generate signed URLs for images
      const listingsWithSignedUrls = await Promise.all(
        (data || []).map(async (listing) => {
          if (listing.image_url) {
            const urlParts = listing.image_url.split('/')
            const filePath = urlParts.slice(-2).join('/')
            
            const { data: signedUrl } = await supabase.storage
              .from('product-images')
              .createSignedUrl(filePath, 3600)
            
            return {
              ...listing,
              image_url: signedUrl?.signedUrl || listing.image_url
            }
          }
          return listing
        })
      )

      setListings(listingsWithSignedUrls)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to load listings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkUser()
    fetchListings()
  }, [checkUser, fetchListings])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-9 w-80 mb-6" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <Badge variant="secondary" className="text-xs">
                {listings.length}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-600">
                <LogOut className="h-4 w-4" />
              </Button>
              <Link href="/upload">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No matching listings" : "No listings yet"}
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              {searchTerm 
                ? "Try different search terms"
                : "Create your first listing to get started"
              }
            </p>
            {!searchTerm && (
              <Link href="/upload">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Listing
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        {listing.image_url ? (
                          <Image
                            src={listing.image_url}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                            width={64}
                            height={64}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {listing.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {listing.description}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(listing.created_at)}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-1 ml-4">
                          <Link href={`/listings/${listing.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/listings/${listing.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}