import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase';
import { UpdateListingData } from '@/app/types';

// Helper function to get user from token
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Unauthorized - No valid authorization header' };
  }
  const token = authHeader.split(' ')[1];
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { user: null, error: 'Unauthorized - Invalid token' };
  }
  return { user, error: null };
}

// GET - Fetch a specific listing
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }
  try {
    const { id } = await params;
    const supabase = createClient();
    const { data: listing, error: dbError } = await supabase
      .from('product_listings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    if (dbError) {
      if (dbError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
    }

    // Generating signed URL for the image if it exists
    if (listing.image_url) {
      const urlParts = listing.image_url.split('/')
      const filePath = urlParts.slice(-2).join('/') // Get the last two parts (folder/filename)
      
      const { data: signedUrl } = await supabase.storage
        .from('product-images')
        .createSignedUrl(filePath, 3600) // 1 hour expiry
      
      if (signedUrl?.signedUrl) {
        listing.image_url = signedUrl.signedUrl
      }
    }

    return NextResponse.json({ listing });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a listing
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body: UpdateListingData = await request.json();
    const { title, description, image_url } = body;
    const updateData: Partial<UpdateListingData> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    const supabase = createClient();
    const { data: listing, error: dbError } = await supabase
      .from('product_listings')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (dbError) {
      if (dbError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }
    return NextResponse.json({ listing });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a listing
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getUserFromRequest(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }
  try {
    const { id } = await params;
    const supabase = createClient();
    // First, get the listing to find the image path
    const { data: listing, error: fetchError } = await supabase
      .from('product_listings')
      .select('image_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
    }
    // Delete the listing
    const { error: deleteError } = await supabase
      .from('product_listings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }
    // Delete the image from storage if it exists
    if (listing?.image_url) {
      try {
        const imagePath = listing.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('product-images')
            .remove([imagePath]);
        }
      } catch {
        // Don't fail the request if image deletion fails
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 