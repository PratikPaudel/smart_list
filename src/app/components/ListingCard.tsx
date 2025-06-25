"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProductListing } from "@/app/types"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/app/lib/supabase"

interface ListingCardProps {
  listing: ProductListing
  onUpdate: () => void
}

export default function ListingCard({ listing, onUpdate }: ListingCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editTitle, setEditTitle] = useState(listing.title)
  const [editDescription, setEditDescription] = useState(listing.description)
  const [secureImageUrl, setSecureImageUrl] = useState(listing.image_url)

  // Generate signed URL for the image
  useEffect(() => {
    const generateSignedUrl = async () => {
      if (listing.image_url) {
        try {
          const urlParts = listing.image_url.split('/')
          const filePath = urlParts.slice(-2).join('/') // Get the last two parts (folder/filename)
          
          const { data: signedUrl, error } = await supabase.storage
            .from('product-images')
            .createSignedUrl(filePath, 3600) // 1 hour expiry
          
          if (error) {
            console.error('Error generating signed URL:', error)
            // Keep the original URL as fallback
            setSecureImageUrl(listing.image_url)
          } else if (signedUrl?.signedUrl) {
            setSecureImageUrl(signedUrl.signedUrl)
          } else {
            // Fallback to original URL if no signed URL generated
            setSecureImageUrl(listing.image_url)
          }
        } catch (error) {
          console.error('Error generating signed URL:', error)
          // Fallback to original URL
          setSecureImageUrl(listing.image_url)
        }
      }
    }

    generateSignedUrl()
  }, [listing.image_url])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const handleEdit = async () => {
    if (!editTitle || !editDescription) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update listing")
      }

      toast.success("Listing updated successfully!")
      setIsEditDialogOpen(false)
      onUpdate()
    } catch (error) {
      console.error("Error updating listing:", error)
      toast.error("Failed to update listing")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete listing")
      }

      toast.success("Listing deleted successfully!")
      setIsDeleteDialogOpen(false)
      onUpdate()
    } catch (error) {
      console.error("Error deleting listing:", error)
      toast.error("Failed to delete listing")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative overflow-hidden">
          {secureImageUrl ? (
            <Image
              src={secureImageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
              fill
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Created {formatDate(listing.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
            {listing.description}
          </p>
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
            <DialogDescription>
              Update your product title and description
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
