export class AudioStreamer {
    constructor(audioContext) {
      this.context = audioContext;
      this.sampleRate = 24000;
      this.isPlaying = false;
      this.currentSource = null;
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
      this.onComplete = () => {};
      this.nextStartTime = 0;
      this.scheduledSources = new Set();
      this.completionRequested = false;
    }

    addPCM16(chunk) {
      const float32Array = new Float32Array(chunk.length / 2);
      const dataView = new DataView(chunk.buffer);

      for (let i = 0; i < chunk.length / 2; i++) {
        try {
          const int16 = dataView.getInt16(i * 2, true);
          float32Array[i] = int16 / 32768;
        } catch (e) {
          console.error(e);
        }
      }

      const audioBuffer = this.context.createBuffer(1, float32Array.length, this.sampleRate);
      audioBuffer.getChannelData(0).set(float32Array);

      this.scheduleBuffer(audioBuffer);
    }

    // Schedules each buffer at an exact, gapless point on the AudioContext's
    // own timeline (instead of reactively after the previous buffer's
    // `onended` event fires). Reactive scheduling left a few milliseconds of
    // JS-event-loop jitter between chunks, which is what caused the
    // clicking/cracking - this removes that gap entirely.
    scheduleBuffer(audioBuffer) {
      this.completionRequested = false;
      this.isPlaying = true;

      const source = this.context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);

      const startAt = Math.max(this.context.currentTime, this.nextStartTime);
      source.start(startAt);
      this.nextStartTime = startAt + audioBuffer.duration;

      this.currentSource = source;
      this.scheduledSources.add(source);

      source.onended = () => {
        this.scheduledSources.delete(source);
        if (source === this.currentSource) {
          this.currentSource = null;
        }
        if (this.scheduledSources.size === 0) {
          this.isPlaying = false;
          if (this.completionRequested) {
            this.completionRequested = false;
            this.onComplete();
          }
        }
      };
    }

    stop() {
      this.isPlaying = false;
      this.completionRequested = false;
      this.nextStartTime = 0;

      for (const source of this.scheduledSources) {
        try {
          source.onended = null;
          source.stop();
          source.disconnect();
        } catch (e) {
          // Ignore if already stopped
        }
      }
      this.scheduledSources.clear();
      this.currentSource = null;

      this.gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.1);

      setTimeout(() => {
        this.gainNode.disconnect();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
      }, 200);
    }

    async resume() {
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      this.gainNode.gain.setValueAtTime(1, this.context.currentTime);
    }

    complete() {
      if (this.scheduledSources.size > 0) {
        this.completionRequested = true;
        return;
      }
      this.onComplete();
    }
  }
