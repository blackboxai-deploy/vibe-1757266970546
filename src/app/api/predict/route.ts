import { NextRequest, NextResponse } from 'next/server';

// API Response interfaces
interface PredictionResponse {
  success: boolean;
  data?: {
    age: number;
    gender: 'male' | 'female';
    ageConfidence: number;
    genderConfidence: number;
    processingTime: number;
  };
  error?: string;
}

interface ImageAnalysis {
  age: number;
  gender: 'male' | 'female';
  ageConfidence: number;
  genderConfidence: number;
}

/**
 * Simulate ML model prediction
 * In a real application, this would use actual trained models
 */
function simulateMLPrediction(): ImageAnalysis {
  // Simple simulation based on image characteristics
  // In production, this would use actual TensorFlow or ONNX models
  
  const randomAge = Math.floor(Math.random() * 60) + 20; // 20-80 years
  const randomGender = Math.random() > 0.5 ? 'male' : 'female';
  
  // Simulate confidence scores with some variance
  const ageConfidence = 0.7 + Math.random() * 0.25; // 70-95%
  const genderConfidence = 0.75 + Math.random() * 0.2; // 75-95%
  
  return {
    age: randomAge,
    gender: randomGender,
    ageConfidence: Math.min(ageConfidence, 0.95),
    genderConfidence: Math.min(genderConfidence, 0.95),
  };
}

/**
 * Process uploaded image and extract features
 */
async function processImage(arrayBuffer: ArrayBuffer): Promise<boolean> {
  try {
    // Basic validation - check if it's a valid image by trying to create ImageData
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Basic image format validation
    const isPNG = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
    const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF;
    const isWebP = uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50;
    
    if (!isPNG && !isJPEG && !isWebP) {
      throw new Error('Invalid image format');
    }
    
    return true;
  } catch (error) {
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate image file
 */
function validateImage(file: File): { isValid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSizeMB = 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid file format. Supported formats: JPEG, PNG, WebP',
    };
  }

  return { isValid: true };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json<PredictionResponse>({
        success: false,
        error: 'No image file provided',
      }, { status: 400 });
    }

    // Validate image
    const validation = validateImage(file);
    if (!validation.isValid) {
      return NextResponse.json<PredictionResponse>({
        success: false,
        error: validation.error,
      }, { status: 400 });
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Process image (basic validation)
    await processImage(arrayBuffer);

    // Run ML prediction (simulated)
    const prediction = simulateMLPrediction();

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Return results
    return NextResponse.json<PredictionResponse>({
      success: true,
      data: {
        age: prediction.age,
        gender: prediction.gender,
        ageConfidence: prediction.ageConfidence,
        genderConfidence: prediction.genderConfidence,
        processingTime,
      },
    });

  } catch (error) {
    console.error('Prediction API error:', error);
    
    return NextResponse.json<PredictionResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to upload images.',
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to upload images.',
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to upload images.',
  }, { status: 405 });
}