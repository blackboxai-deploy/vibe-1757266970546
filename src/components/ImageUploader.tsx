'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { validateImageFile, ImageProcessor } from '@/lib/image-processing';

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: HTMLCanvasElement) => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export function ImageUploader({ onImageSelect, isProcessing = false, disabled = false }: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0] as File);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    setError(null);
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setIsGeneratingPreview(true);
      
      // Create image processor and generate preview
      const processor = new ImageProcessor();
      const preview = await processor.createPreviewCanvas(file, 400);
      
      // Call parent callback
      onImageSelect(file, preview);
      
      // Clean up
      processor.dispose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleButtonClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <Card 
        className={`
          border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        onClick={handleButtonClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            {/* Upload Icon */}
            <div className={`
              w-16 h-16 mx-auto rounded-full flex items-center justify-center
              ${disabled 
                ? 'bg-gray-100' 
                : isDragOver 
                  ? 'bg-blue-100' 
                  : 'bg-gray-100'
              }
            `}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${disabled 
                  ? 'bg-gray-200' 
                  : isDragOver 
                    ? 'bg-blue-200' 
                    : 'bg-gray-200'
                }
              `}>
                <div className={`
                  w-4 h-4 rounded-full
                  ${disabled 
                    ? 'bg-gray-400' 
                    : isDragOver 
                      ? 'bg-blue-500' 
                      : 'bg-gray-400'
                  }
                `}></div>
              </div>
            </div>

            {/* Upload Text */}
            <div className="space-y-2">
              <h3 className={`text-lg font-semibold ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
                {isGeneratingPreview 
                  ? 'Processing image...' 
                  : isProcessing 
                    ? 'Analyzing image...'
                    : 'Upload an image'
                }
              </h3>
              
              {!isGeneratingPreview && !isProcessing && (
                <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                  Drag and drop your image here, or click to browse
                </p>
              )}
            </div>

            {/* Progress Bar */}
            {(isGeneratingPreview || isProcessing) && (
              <div className="space-y-2">
                <Progress value={isGeneratingPreview ? 50 : 75} className="h-1" />
                <p className="text-xs text-gray-500">
                  {isGeneratingPreview ? 'Generating preview...' : 'Running ML analysis...'}
                </p>
              </div>
            )}

            {/* Upload Button */}
            {!isGeneratingPreview && !isProcessing && (
              <Button 
                variant="outline" 
                disabled={disabled}
                className="mt-4"
              >
                Choose File
              </Button>
            )}

            {/* File Format Info */}
            {!isGeneratingPreview && !isProcessing && (
              <div className="text-xs text-gray-500 space-y-1">
                <div>Supported formats: JPEG, PNG, WebP</div>
                <div>Maximum file size: 10MB</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="mt-4 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}