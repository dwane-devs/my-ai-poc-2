import { pipeline, env } from '@huggingface/transformers';

// Ensure 'env.backends.onnx.wasm' is defined before accessing its properties
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.proxy = false;
}

let whisper = null;

self.onmessage = (event) => {
  if (event.data.type === 'PING') {
    self.postMessage({ type: 'PONG' });
  }
};
