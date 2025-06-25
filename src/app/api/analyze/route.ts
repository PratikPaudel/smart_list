import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage, generateProductContent } from '@/app/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Analyze the image
    const analysis = await analyzeImage(buffer);
    
    // Generate product content
    const content = await generateProductContent(analysis);

    return NextResponse.json({
      success: true,
      analysis,
      content
    });

  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 