'use client';

import { useState } from 'react';
import { ModelLoader } from '@/components/ModelLoader';
import { ImageUploader } from '@/components/ImageUploader';
import { PredictionResults } from '@/components/PredictionResults';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createImageProcessor, type ImageProcessingResult } from '@/lib/image-processing';
import { predict, type AgeGenderPrediction } from '@/lib/ml-models';

interface AnalysisState {
  file: File | null;
  preview: HTMLCanvasElement | null;
  prediction: AgeGenderPrediction | null;
  isProcessing: boolean;
  error: string | null;
}

export default function HomePage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    file: null,
    preview: null,
    prediction: null,
    isProcessing: false,
    error: null,
  });

  const handleModelLoadComplete = () => {
    // Models loaded successfully
  };

  const handleImageSelect = async (file: File, preview: HTMLCanvasElement) => {
    setAnalysisState(prev => ({
      ...prev,
      file,
      preview,
      prediction: null,
      error: null,
      isProcessing: true,
    }));

    try {
      // Process the image for ML prediction
      const processor = createImageProcessor();
      const result: ImageProcessingResult = await processor.processImageFile(file);
      
      // Run ML prediction
      const prediction = await predict(result.imageData);
      
      setAnalysisState(prev => ({
        ...prev,
        prediction,
        isProcessing: false,
      }));

      // Clean up
      processor.dispose();
    } catch (error) {
      setAnalysisState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Analysis failed',
        isProcessing: false,
      }));
    }
  };

  const handleReset = () => {
    setAnalysisState({
      file: null,
      preview: null,
      prediction: null,
      isProcessing: false,
      error: null,
    });
  };

  const handleNewAnalysis = () => {
    handleReset();
  };

  return (
    <ModelLoader onLoadComplete={handleModelLoadComplete}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Vision Lab</h1>
                  <p className="text-xs text-gray-600">Age & Gender Detection</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  TensorFlow.js
                </Badge>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  Privacy-First
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-sm"></div>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Facial Analysis
            </h2>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Upload any photo and get instant age and gender predictions using advanced machine learning models. 
              All processing happens in your browser for complete privacy.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Client-side processing
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Real-time analysis
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                No data uploaded
              </div>
            </div>
          </div>

          {/* Upload Section */}
          {!analysisState.file && (
            <div className="max-w-2xl mx-auto mb-12">
              <ImageUploader
                onImageSelect={handleImageSelect}
                isProcessing={analysisState.isProcessing}
              />
            </div>
          )}

          {/* Results Section */}
          {analysisState.file && (
            <div className="space-y-6">
              {/* Action Bar */}
              <div className="flex justify-center">
                <Button onClick={handleNewAnalysis} variant="outline">
                  Analyze New Image
                </Button>
              </div>

              {/* Error Alert */}
              {analysisState.error && (
                <Alert className="max-w-2xl mx-auto border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    <div className="font-medium mb-1">Analysis Failed</div>
                    <div>{analysisState.error}</div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Prediction Results */}
              <PredictionResults
                prediction={analysisState.prediction}
                imagePreview={analysisState.preview}
                fileName={analysisState.file.name}
                isLoading={analysisState.isProcessing}
              />
            </div>
          )}

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  </div>
                  Age Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Advanced neural networks analyze facial features to estimate age with high accuracy. 
                  Results typically range from 18-80 years with confidence scoring.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                  </div>
                  Gender Classification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Computer vision models trained on diverse datasets provide gender classification 
                  with confidence metrics for transparent and reliable results.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  </div>
                  Privacy First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  All processing happens locally in your browser using TensorFlow.js. 
                  No images are uploaded to servers, ensuring complete privacy protection.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Technical Info */}
          <div className="mt-12 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">Framework</div>
                  <div className="text-gray-600">TensorFlow.js</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Architecture</div>
                  <div className="text-gray-600">CNN + MobileNet</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Input Size</div>
                  <div className="text-gray-600">224×224 RGB</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Processing</div>
                  <div className="text-gray-600">Client-side</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-600">
              <p>
                Powered by TensorFlow.js • Built with Next.js • 
                <span className="font-medium"> Privacy-focused AI vision technology</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ModelLoader>
  );
}