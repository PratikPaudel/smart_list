import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize the Google Cloud Vision client using environment variables
const client = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

export interface VisionAnalysisResult {
  labels: string[];
  text: string;
  objects: string[];
  colors: string[];
  confidence: number;
}

export async function analyzeImage(imageBuffer: Buffer): Promise<VisionAnalysisResult> {
  try {
    // Perform label detection
    const [labelResult] = await client.labelDetection(imageBuffer);
    const labels = labelResult.labelAnnotations?.map(label => label.description || '').filter(Boolean) || [];

    // Perform text detection
    const [textResult] = await client.textDetection(imageBuffer);
    const text = textResult.fullTextAnnotation?.text || '';

    // Perform object detection
    const [objectResult] = await client.objectLocalization?.(imageBuffer) || [{}];
    const objects = objectResult?.localizedObjectAnnotations?.map(obj => obj.name || '').filter(Boolean) || [];

    // Perform image properties detection (colors)
    const [propertiesResult] = await client.imageProperties?.(imageBuffer) || [{}];
    const colors = propertiesResult.imagePropertiesAnnotation?.dominantColors?.colors?.map(color => {
      const rgb = color.color;
      if (rgb) {
        return `rgb(${rgb.red || 0}, ${rgb.green || 0}, ${rgb.blue || 0})`;
      }
      return '';
    }).filter(Boolean) || [];

    // Calculate overall confidence
    const labelConfidence = labelResult.labelAnnotations?.[0]?.score || 0;
    const objectConfidence = objectResult.localizedObjectAnnotations?.[0]?.score || 0;
    const confidence = Math.max(labelConfidence, objectConfidence);

    return {
      labels,
      text,
      objects,
      colors,
      confidence
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image');
  }
}

export async function generateProductContent(analysis: VisionAnalysisResult): Promise<{ title: string; description: string }> {
  // Combine all detected information
  const allKeywords = [
    ...analysis.labels,
    ...analysis.objects,
    ...analysis.text.split(' ').filter(word => word.length > 3)
  ].filter(Boolean);

  // Remove duplicates and common words
  const uniqueKeywords = [...new Set(allKeywords)].filter(keyword =>
    !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(keyword.toLowerCase())
  );

  // Generate title (use first 3-5 most relevant keywords)
  const titleKeywords = uniqueKeywords.slice(0, 4);
  const title = titleKeywords.length > 0
    ? titleKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Product';

  // Generate description
  const descriptionParts = [];
 
  if (analysis.labels.length > 0) {
    descriptionParts.push(`This ${analysis.labels[0]} features high-quality materials and craftsmanship.`);
  }
 
  if (analysis.objects.length > 0) {
    descriptionParts.push(`Perfect for ${analysis.objects[0]} enthusiasts and collectors.`);
  }
 
  if (analysis.colors.length > 0) {
    descriptionParts.push(`Available in beautiful ${analysis.colors[0]} tones.`);
  }
 
  if (analysis.text) {
    descriptionParts.push(`Includes detailed specifications and features.`);
  }

  const description = descriptionParts.length > 0
    ? descriptionParts.join(' ')
    : 'A high-quality product with excellent features and durability. Perfect for various uses and applications.';

  return { title, description };
}