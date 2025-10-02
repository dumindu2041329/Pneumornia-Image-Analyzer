import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const MODEL_VERSION = 'v1.0-tfjs';
const IMAGE_SIZE = 224;

export class PneumoniaDetectionService {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await tf.ready();
      await tf.setBackend('webgl');

      this.model = await this.createModel();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing detection service:', error);
      throw new Error('Failed to initialize AI model');
    }
  }

  private async createModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [IMAGE_SIZE, IMAGE_SIZE, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.flatten(),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 2, activation: 'softmax' }),
      ],
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  async analyzeImage(imageFile: File): Promise<{
    prediction: 'normal' | 'pneumonia';
    confidence: number;
    processingTime: number;
  }> {
    if (!this.isInitialized || !this.model) {
      throw new Error('Model not initialized');
    }

    const startTime = performance.now();

    try {
      const tensor = await this.preprocessImage(imageFile);

      const predictions = this.model.predict(tensor) as tf.Tensor;
      const probabilities = await predictions.data();

      tensor.dispose();
      predictions.dispose();

      const normalProb = probabilities[0];
      const pneumoniaProb = probabilities[1];

      const isPneumonia = pneumoniaProb > normalProb;
      const confidence = isPneumonia ? pneumoniaProb : normalProb;

      const processingTime = Math.round(performance.now() - startTime);

      return {
        prediction: isPneumonia ? 'pneumonia' : 'normal',
        confidence: Number(confidence.toFixed(4)),
        processingTime,
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image');
    }
  }

  private async preprocessImage(file: File): Promise<tf.Tensor4D> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const tensor = tf.browser
              .fromPixels(img)
              .resizeNearestNeighbor([IMAGE_SIZE, IMAGE_SIZE])
              .toFloat()
              .div(255.0)
              .expandDims(0) as tf.Tensor4D;

            resolve(tensor);
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  getModelVersion(): string {
    return MODEL_VERSION;
  }

  isReady(): boolean {
    return this.isInitialized && this.model !== null;
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isInitialized = false;
    }
  }
}

export const detectionService = new PneumoniaDetectionService();
