/**
 * Image processing utilities for ML model preprocessing
 */

export interface ImageProcessingResult {
  imageData: ImageData;
  originalWidth: number;
  originalHeight: number;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
  }

  /**
   * Process uploaded file and return ImageData for ML model
   */
  async processImageFile(file: File): Promise<ImageProcessingResult> {
    return new Promise((resolve, reject) => {
      if (!this.isValidImageFile(file)) {
        reject(new Error('Invalid image file format'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const result = this.processImageElement(img);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Process Image element and return normalized ImageData
   */
  processImageElement(img: HTMLImageElement): ImageProcessingResult {
    const originalWidth = img.width;
    const originalHeight = img.height;

    // Set canvas size to target size for ML model (224x224)
    const targetSize = 224;
    this.canvas.width = targetSize;
    this.canvas.height = targetSize;

    // Clear canvas
    this.ctx.clearRect(0, 0, targetSize, targetSize);

    // Calculate scaling to maintain aspect ratio
    const scale = Math.min(targetSize / originalWidth, targetSize / originalHeight);
    const scaledWidth = originalWidth * scale;
    const scaledHeight = originalHeight * scale;

    // Center the image
    const offsetX = (targetSize - scaledWidth) / 2;
    const offsetY = (targetSize - scaledHeight) / 2;

    // Draw image with proper scaling and centering
    this.ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

    // Get image data for ML processing
    const imageData = this.ctx.getImageData(0, 0, targetSize, targetSize);

    return {
      imageData,
      originalWidth,
      originalHeight,
    };
  }

  /**
   * Create a preview canvas for display purposes
   */
  createPreviewCanvas(file: File, maxSize: number = 400): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate preview size maintaining aspect ratio
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw scaled image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas);
      };

      img.onerror = () => reject(new Error('Failed to load image for preview'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convert ImageData to data URL for display
   */
  imageDataToDataUrl(imageData: ImageData): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL();
  }

  /**
   * Validate image file format
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type.toLowerCase());
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file size (max 10MB)
   */
  static isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // Clean up canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

/**
 * Utility functions
 */

export const createImageProcessor = (): ImageProcessor => new ImageProcessor();

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!ImageProcessor.isValidFileSize(file)) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is 10MB. Current size: ${ImageProcessor.formatFileSize(file.size)}`,
    };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid file format. Supported formats: JPEG, PNG, WebP',
    };
  }

  return { isValid: true };
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};