// Google Gemini API for image analysis and content generation
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface VisionAnalysisResult {
  labels: string[];
  text: string;
  objects: string[];
  colors: string[];
  confidence: number;
}

async function callGeminiAPI(prompt: string, imageBase64?: string) {
  const requestBody: any = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  // Add image if provided
  if (imageBase64) {
    requestBody.contents[0].parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: imageBase64
      }
    });
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function analyzeImage(imageBuffer: Buffer): Promise<VisionAnalysisResult> {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Use Gemini to analyze the image
    const prompt = `Analyze this image with extreme detail and specificity. Focus on identifying the exact model, brand, and specific features.

Please respond with ONLY a valid JSON object in this exact format:
{
  "labels": ["specific brand", "exact model", "specific features", "category"],
  "text": "any text, numbers, or markings visible in the image",
  "objects": ["exact product name", "specific components", "identifiable parts"],
  "colors": ["specific color names", "finish type"],
  "confidence": 0.95
}

Be extremely specific - if it's an iPhone, identify the exact model (iPhone 14 Pro, iPhone 7, etc.). If it's a laptop, identify the brand and model. Include any visible text, serial numbers, or model identifiers.`;

    const analysisText = await callGeminiAPI(prompt, base64Image);
    
    if (!analysisText) {
      throw new Error('No analysis response from Gemini');
    }


    // Extract JSON from markdown code blocks if present
    let jsonText = analysisText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response
    let analysis: any;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.warn('Failed to parse JSON response, using fallback parsing');
      analysis = {
        labels: ['product', 'item'],
        text: '',
        objects: ['object'],
        colors: ['mixed'],
        confidence: 0.7
      };
      
      // Extract basic information from the response
      const text = analysisText.toLowerCase();
      if (text.includes('text') || text.includes('words') || text.includes('letters')) {
        analysis.text = 'Text detected in image';
      }
      if (text.includes('red') || text.includes('blue') || text.includes('green') || text.includes('yellow') || text.includes('black') || text.includes('white')) {
        analysis.colors = ['mixed colors'];
      }
    }

    return {
      labels: analysis.labels || [],
      text: analysis.text || '',
      objects: analysis.objects || [],
      colors: analysis.colors || [],
      confidence: analysis.confidence || 0.8
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image');
  }
}

export async function generateProductContent(analysis: VisionAnalysisResult): Promise<{ title: string; description: string }> {
  try {
    // Use Gemini to generate better product content based on the analysis
    const prompt = `Generate a compelling product title and description for an e-commerce listing based on this detailed analysis:

Labels: ${analysis.labels.join(', ')}
Objects: ${analysis.objects.join(', ')}
Colors: ${analysis.colors.join(', ')}
Text: ${analysis.text}

Create a title and description that highlights the specific model, brand, and unique features. Be precise and detailed.

Please respond with ONLY a valid JSON object in this exact format:
{
  "title": "Specific model name with key features (max 60 characters)",
  "description": "Detailed description mentioning exact model, brand, colors, and specific features (max 200 words)"
}

Do not include any other text, just the JSON object.`;

    const contentText = await callGeminiAPI(prompt);
    
    if (!contentText) {
      throw new Error('No content response from Gemini');
    }


    // Extract JSON from markdown code blocks if present
    let jsonText = contentText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response
    let content: any;
    try {
      content = JSON.parse(jsonText);
    } catch (parseError) {
      console.warn('Failed to parse JSON response, using fallback content generation');
      // Fallback to the original logic
      const allKeywords = [
        ...analysis.labels,
        ...analysis.objects,
        ...analysis.text.split(' ').filter(word => word.length > 3)
      ].filter(Boolean);

      const uniqueKeywords = [...new Set(allKeywords)].filter(keyword =>
        !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(keyword.toLowerCase())
      );

      const titleKeywords = uniqueKeywords.slice(0, 4);
      const title = titleKeywords.length > 0
        ? titleKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : 'Product';

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

      content = { title, description };
    }

    return {
      title: content.title || 'Product',
      description: content.description || 'A high-quality product with excellent features and durability.'
    };
  } catch (error) {
    console.error('Error generating product content:', error);
    // Fallback to basic content generation
    const allKeywords = [
      ...analysis.labels,
      ...analysis.objects,
      ...analysis.text.split(' ').filter(word => word.length > 3)
    ].filter(Boolean);

    const uniqueKeywords = [...new Set(allKeywords)].filter(keyword =>
      !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(keyword.toLowerCase())
    );

    const titleKeywords = uniqueKeywords.slice(0, 4);
    const title = titleKeywords.length > 0
      ? titleKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : 'Product';

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
}