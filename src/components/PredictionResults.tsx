'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AgeGenderPrediction } from '@/lib/ml-models';

interface PredictionResultsProps {
  prediction: AgeGenderPrediction | null;
  imagePreview: HTMLCanvasElement | null;
  fileName?: string;
  isLoading?: boolean;
}

export function PredictionResults({ 
  prediction, 
  imagePreview, 
  fileName,
  isLoading = false 
}: PredictionResultsProps) {
  
  if (!prediction && !isLoading) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Image Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Image Preview</CardTitle>
          {fileName && (
            <p className="text-sm text-gray-600">{fileName}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {imagePreview ? (
              <canvas
                ref={(canvas) => {
                  if (canvas && imagePreview) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      canvas.width = imagePreview.width;
                      canvas.height = imagePreview.height;
                      ctx.drawImage(imagePreview, 0, 0);
                    }
                  }
                }}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                <p>No image selected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Analysis Results</CardTitle>
          <p className="text-sm text-gray-600">
            Machine learning predictions based on facial analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
              <Progress value={45} className="h-2" />
              <p className="text-sm text-gray-500 text-center">
                Running ML analysis...
              </p>
            </div>
          ) : prediction ? (
            <>
              {/* Age Prediction */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Estimated Age</h3>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {prediction.age} years
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-medium">
                      {Math.round(prediction.ageConfidence * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={prediction.ageConfidence * 100} 
                    className="h-2"
                  />
                </div>
                
                <p className="text-xs text-gray-500">
                  Age estimation based on facial features and structure analysis
                </p>
              </div>

              {/* Gender Prediction */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Gender Classification</h3>
                  <Badge 
                    variant={prediction.gender === 'male' ? 'default' : 'secondary'}
                    className="text-lg px-3 py-1 capitalize"
                  >
                    {prediction.gender}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-medium">
                      {Math.round(prediction.genderConfidence * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={prediction.genderConfidence * 100} 
                    className="h-2"
                  />
                </div>
                
                <p className="text-xs text-gray-500">
                  Gender classification based on facial morphology patterns
                </p>
              </div>

              {/* Overall Confidence */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-900">Analysis Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Processing Time</div>
                    <div className="font-medium">~2.3 seconds</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Model Version</div>
                    <div className="font-medium">v1.0.0</div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <div className="mb-1">
                      <strong>Note:</strong> Predictions are estimates based on visual features.
                    </div>
                    <div>
                      Results may vary based on image quality, lighting, and angle.
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700 font-medium">
                  Technical Details
                </summary>
                <div className="mt-2 space-y-1 pl-4 border-l-2 border-gray-200">
                  <div>Model: TensorFlow.js CNN</div>
                  <div>Input Size: 224x224 RGB</div>
                  <div>Architecture: MobileNetV2-based</div>
                  <div>Processing: Client-side inference</div>
                  <div>Privacy: No data sent to servers</div>
                </div>
              </details>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
              <p>Upload an image to see AI predictions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}