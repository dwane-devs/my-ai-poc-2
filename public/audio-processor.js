"use strict";
/// <reference lib="WebWorker" />
// Remove the duplicate declarations and keep only the actual processor implementation
class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input && input.length > 0) {
            const channelData = input[0];
            this.port.postMessage(channelData.slice()); // Send a copy of the data
        }
        return true;
    }
}
registerProcessor('audio-processor', AudioProcessor);
