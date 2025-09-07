'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loadModels, getModelLoadingState, type ModelLoadingState } from '@/lib/ml-models';

interface ModelLoaderProps {
  onLoadComplete: (success: boolean) => void;
  children: React.ReactNode;
}

export function ModelLoader({ onLoadComplete, children }: ModelLoaderProps) {
  const [loadingState, setLoadingState] = useState<ModelLoadingState>({
    isLoading: false,
    isLoaded: false,
    error: null,
    progress: 0,
  });

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const initializeModels = async () => {
      try {
        setLoadingState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Start loading models
        const loadPromise = loadModels();
        
        // Poll for loading progress
        intervalId = setInterval(() => {
          const currentState = getModelLoadingState();
          setLoadingState(currentState);
          
          if (currentState.isLoaded || currentState.error) {
            clearInterval(intervalId);
            onLoadComplete(currentState.isLoaded);
          }
        }, 100);

        await loadPromise;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setLoadingState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        onLoadComplete(false);
        clearInterval(intervalId);
      }
    };

    initializeModels();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [onLoadComplete]);

  if (loadingState.isLoaded) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full"></div>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Loading AI Models
              </h2>
              <p className="text-sm text-gray-600">
                Initializing age and gender detection models...
              </p>
            </div>

            {/* Progress Section */}
            {loadingState.isLoading && (
              <div className="space-y-3">
                <Progress value={loadingState.progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round(loadingState.progress)}%</span>
                </div>
                
                {/* Loading stages */}
                <div className="text-xs text-gray-600">
                  {loadingState.progress < 20 && 'Initializing TensorFlow.js...'}
                  {loadingState.progress >= 20 && loadingState.progress < 60 && 'Loading age detection model...'}
                  {loadingState.progress >= 60 && loadingState.progress < 90 && 'Loading gender detection model...'}
                  {loadingState.progress >= 90 && loadingState.progress < 100 && 'Warming up models...'}
                  {loadingState.progress === 100 && 'Ready!'}
                </div>
              </div>
            )}

            {/* Error Section */}
            {loadingState.error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800 text-sm">
                  <div className="space-y-2">
                    <div className="font-medium">Failed to load models</div>
                    <div>{loadingState.error}</div>
                    <div className="text-xs">
                      Please refresh the page to try again.
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Features List */}
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Features</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                  Age detection (0-100 years)
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                  Gender classification
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                  Confidence scoring
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                  Real-time processing
                </li>
              </ul>
            </div>

            {/* Technical Info */}
            <div className="text-xs text-gray-500">
              <div>Powered by TensorFlow.js</div>
              <div>Client-side processing • Privacy-first</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}