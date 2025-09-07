import * as tf from '@tensorflow/tfjs';

// Model interfaces
export interface AgeGenderPrediction {
  age: number;
  gender: 'male' | 'female';
  ageConfidence: number;
  genderConfidence: number;
}

export interface ModelLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  progress: number;
}



class MLModelManager {
  private ageModel: tf.LayersModel | null = null;
  private genderModel: tf.LayersModel | null = null;
  private isInitialized = false;
  private loadingState: ModelLoadingState = {
    isLoading: false,
    isLoaded: false,
    error: null,
    progress: 0,
  };

  async loadModels(): Promise<void> {
    if (this.isInitialized) return;

    this.loadingState.isLoading = true;
    this.loadingState.error = null;
    this.loadingState.progress = 0;

    try {
      // Initialize TensorFlow.js
      await tf.ready();
      this.loadingState.progress = 20;

      // Create simple models for demonstration
      // In a real application, you would load pre-trained models
      this.ageModel = this.createAgeModel();
      this.loadingState.progress = 60;

      this.genderModel = this.createGenderModel();
      this.loadingState.progress = 90;

      // Warm up models with dummy data
      const dummyInput = tf.zeros([1, 224, 224, 3]);
      await this.ageModel.predict(dummyInput);
      await this.genderModel.predict(dummyInput);
      dummyInput.dispose();

      this.loadingState.progress = 100;
      this.loadingState.isLoaded = true;
      this.isInitialized = true;
    } catch (error) {
      this.loadingState.error = error instanceof Error ? error.message : 'Failed to load models';
      console.error('Model loading error:', error);
    } finally {
      this.loadingState.isLoading = false;
    }
  }

  private createAgeModel(): tf.LayersModel {
    // Simple age regression model
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          kernelSize: 3,
          filters: 32,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ kernelSize: 3, filters: 64, activation: 'relu' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ kernelSize: 3, filters: 128, activation: 'relu' }),
        tf.layers.globalAveragePooling2d({}),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 1, activation: 'linear' }), // Age prediction (0-100)
      ],
    });

    // Compile the model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });

    return model;
  }

  private createGenderModel(): tf.LayersModel {
    // Simple gender classification model
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          kernelSize: 3,
          filters: 32,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ kernelSize: 3, filters: 64, activation: 'relu' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ kernelSize: 3, filters: 128, activation: 'relu' }),
        tf.layers.globalAveragePooling2d({}),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 2, activation: 'softmax' }), // [male, female] probabilities
      ],
    });

    // Compile the model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  async predict(imageData: ImageData): Promise<AgeGenderPrediction> {
    if (!this.isInitialized || !this.ageModel || !this.genderModel) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    // Preprocess the image
    const preprocessedImage = this.preprocessImage(imageData);

    try {
      // Get age prediction
      const agePrediction = this.ageModel.predict(preprocessedImage) as tf.Tensor;
      const ageValue = await agePrediction.data();
      const predictedAge = Math.max(0, Math.min(100, ageValue[0] * 100 + 25)); // Scale to reasonable age range
      
      // Get gender prediction
      const genderPrediction = this.genderModel.predict(preprocessedImage) as tf.Tensor;
      const genderProbs = await genderPrediction.data();
      const maleProb = genderProbs[0];
      const femaleProb = genderProbs[1];
      const predictedGender = maleProb > femaleProb ? 'male' : 'female';
      const genderConfidence = Math.max(maleProb, femaleProb);

      // Clean up tensors
      agePrediction.dispose();
      genderPrediction.dispose();
      preprocessedImage.dispose();

      return {
        age: Math.round(predictedAge),
        gender: predictedGender,
        ageConfidence: 0.75 + Math.random() * 0.2, // Simulated confidence
        genderConfidence: genderConfidence,
      };
    } catch (error) {
      preprocessedImage.dispose();
      throw new Error(`Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private preprocessImage(imageData: ImageData): tf.Tensor {
    // Convert ImageData to tensor and preprocess
    return tf.tidy(() => {
      // Create tensor from image data
      let tensor = tf.browser.fromPixels(imageData);
      
      // Resize to 224x224
      tensor = tf.image.resizeBilinear(tensor, [224, 224]);
      
      // Normalize pixel values to [0, 1]
      tensor = tensor.div(255.0);
      
      // Add batch dimension
      tensor = tensor.expandDims(0);
      
      return tensor;
    });
  }

  getLoadingState(): ModelLoadingState {
    return { ...this.loadingState };
  }

  dispose(): void {
    if (this.ageModel) {
      this.ageModel.dispose();
      this.ageModel = null;
    }
    if (this.genderModel) {
      this.genderModel.dispose();
      this.genderModel = null;
    }
    this.isInitialized = false;
  }
}

// Singleton instance
export const modelManager = new MLModelManager();

// Utility functions
export const loadModels = () => modelManager.loadModels();
export const predict = (imageData: ImageData) => modelManager.predict(imageData);
export const getModelLoadingState = () => modelManager.getLoadingState();
export const disposeModels = () => modelManager.dispose();