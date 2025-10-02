import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

const MODEL_VERSION = 'v3.0-efficientnetb0';
const IMAGE_SIZE = 224;

export class PneumoniaDetectionService {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await tf.ready();
      await tf.setBackend('webgl');

      this.model = await this.createEfficientNetB0Model();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing detection service:', error);
      throw new Error('Failed to initialize AI model');
    }
  }

  private swish(x: tf.SymbolicTensor): tf.SymbolicTensor {
    return tf.layers.multiply().apply([
      x,
      tf.layers.activation({ activation: 'sigmoid' }).apply(x) as tf.SymbolicTensor
    ]) as tf.SymbolicTensor;
  }

  private mbConvBlock(
    x: tf.SymbolicTensor,
    filters: number,
    kernelSize: number,
    strides: number,
    expandRatio: number,
    seRatio: number,
    blockId: number
  ): tf.SymbolicTensor {
    const inputFilters = x.shape[x.shape.length - 1] as number;
    const expandedFilters = inputFilters * expandRatio;

    let y = x;

    if (expandRatio !== 1) {
      y = tf.layers.conv2d({
        filters: expandedFilters,
        kernelSize: 1,
        padding: 'same',
        use_bias: false,
        name: `block${blockId}_expand_conv`
      }).apply(y) as tf.SymbolicTensor;

      y = tf.layers.batchNormalization({ name: `block${blockId}_expand_bn` }).apply(y) as tf.SymbolicTensor;
      y = this.swish(y);
    }

    y = tf.layers.depthwiseConv2d({
      kernelSize: kernelSize,
      strides: strides,
      padding: 'same',
      use_bias: false,
      name: `block${blockId}_dwconv`
    }).apply(y) as tf.SymbolicTensor;

    y = tf.layers.batchNormalization({ name: `block${blockId}_bn` }).apply(y) as tf.SymbolicTensor;
    y = this.swish(y);

    if (seRatio > 0 && seRatio <= 1) {
      const seFilters = Math.max(1, Math.floor(inputFilters * seRatio));
      let se = tf.layers.globalAveragePooling2d({ name: `block${blockId}_se_squeeze` }).apply(y) as tf.SymbolicTensor;
      se = tf.layers.reshape({ targetShape: [1, 1, expandedFilters] }).apply(se) as tf.SymbolicTensor;
      se = tf.layers.conv2d({
        filters: seFilters,
        kernelSize: 1,
        activation: 'relu',
        name: `block${blockId}_se_reduce`
      }).apply(se) as tf.SymbolicTensor;
      se = tf.layers.conv2d({
        filters: expandedFilters,
        kernelSize: 1,
        activation: 'sigmoid',
        name: `block${blockId}_se_expand`
      }).apply(se) as tf.SymbolicTensor;
      y = tf.layers.multiply({ name: `block${blockId}_se_excite` }).apply([y, se]) as tf.SymbolicTensor;
    }

    y = tf.layers.conv2d({
      filters: filters,
      kernelSize: 1,
      padding: 'same',
      use_bias: false,
      name: `block${blockId}_project_conv`
    }).apply(y) as tf.SymbolicTensor;

    y = tf.layers.batchNormalization({ name: `block${blockId}_project_bn` }).apply(y) as tf.SymbolicTensor;

    if (strides === 1 && inputFilters === filters) {
      y = tf.layers.add({ name: `block${blockId}_add` }).apply([x, y]) as tf.SymbolicTensor;
    }

    return y;
  }

  private async createEfficientNetB0Model(): Promise<tf.LayersModel> {
    const input = tf.input({ shape: [IMAGE_SIZE, IMAGE_SIZE, 3] });

    let x = tf.layers.rescaling({ scale: 1.0 / 255.0 }).apply(input) as tf.SymbolicTensor;

    x = tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      strides: 2,
      padding: 'same',
      use_bias: false,
      name: 'stem_conv'
    }).apply(x) as tf.SymbolicTensor;

    x = tf.layers.batchNormalization({ name: 'stem_bn' }).apply(x) as tf.SymbolicTensor;
    x = this.swish(x);

    x = this.mbConvBlock(x, 16, 3, 1, 1, 0.25, 1);
    x = this.mbConvBlock(x, 24, 3, 2, 6, 0.25, 2);
    x = this.mbConvBlock(x, 24, 3, 1, 6, 0.25, 3);
    x = this.mbConvBlock(x, 40, 5, 2, 6, 0.25, 4);
    x = this.mbConvBlock(x, 40, 5, 1, 6, 0.25, 5);
    x = this.mbConvBlock(x, 80, 3, 2, 6, 0.25, 6);
    x = this.mbConvBlock(x, 80, 3, 1, 6, 0.25, 7);
    x = this.mbConvBlock(x, 80, 3, 1, 6, 0.25, 8);
    x = this.mbConvBlock(x, 112, 5, 1, 6, 0.25, 9);
    x = this.mbConvBlock(x, 112, 5, 1, 6, 0.25, 10);
    x = this.mbConvBlock(x, 112, 5, 1, 6, 0.25, 11);
    x = this.mbConvBlock(x, 192, 5, 2, 6, 0.25, 12);
    x = this.mbConvBlock(x, 192, 5, 1, 6, 0.25, 13);
    x = this.mbConvBlock(x, 192, 5, 1, 6, 0.25, 14);
    x = this.mbConvBlock(x, 192, 5, 1, 6, 0.25, 15);
    x = this.mbConvBlock(x, 320, 3, 1, 6, 0.25, 16);

    x = tf.layers.conv2d({
      filters: 1280,
      kernelSize: 1,
      padding: 'same',
      use_bias: false,
      name: 'top_conv'
    }).apply(x) as tf.SymbolicTensor;

    x = tf.layers.batchNormalization({ name: 'top_bn' }).apply(x) as tf.SymbolicTensor;
    x = this.swish(x);

    x = tf.layers.globalAveragePooling2d({ name: 'avg_pool' }).apply(x) as tf.SymbolicTensor;
    x = tf.layers.dropout({ rate: 0.2, name: 'top_dropout' }).apply(x) as tf.SymbolicTensor;

    const output = tf.layers.dense({
      units: 2,
      activation: 'softmax',
      name: 'predictions'
    }).apply(x) as tf.SymbolicTensor;

    const model = tf.model({
      inputs: input,
      outputs: output,
      name: 'efficientnetb0'
    });

    model.compile({
      optimizer: tf.train.adam(0.0001),
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
