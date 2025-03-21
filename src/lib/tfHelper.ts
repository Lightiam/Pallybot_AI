import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export const initializeTensorFlow = async () => {
  try {
    await tf.setBackend('webgl');
    await tf.ready();
    console.log('TensorFlow.js initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing TensorFlow.js:', error);
    return false;
  }
};

export const loadFaceMeshModel = async () => {
  try {
    const model = await tf.loadGraphModel(
      'https://tfhub.dev/mediapipe/tfjs-model/face_landmarks_detection/1/default/1',
      { fromTFHub: true }
    );
    return model;
  } catch (error) {
    console.error('Error loading face mesh model:', error);
    throw error;
  }
};