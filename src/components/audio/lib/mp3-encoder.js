import { Mp3Encoder } from 'lamejs';

export default class {
  constructor(config) {
    this.sampleRate = config.sampleRate
    this.bitRate    = config.bitRate
    this.channels   = config.channels
    this.mp3Data    = []
    this.encoder    = new Mp3Encoder(this.channels, this.sampleRate, this.bitRate)
   }

  async encodeMono(webmBlob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(webmBlob);
      reader.onloadend = () => {
        const samples = new Int16Array(reader.result);
        const mp3Buffer = this.encoder.encodeBuffer(samples);
        const finalBuffer = this.encoder.flush();
        const mp3Blob = new Blob([mp3Buffer, finalBuffer], { type: 'audio/mp3' });
        this.mp3Data = [];
        resolve({
          id   : Date.now(),
          blob : mp3Blob,
          url  : URL.createObjectURL(mp3Blob)
        });
      };

      reader.onerror = reject;
    });
  }

  async encodeStereo(leftChannel, rightChannel) {
    const sampleBlockSize = 1152;
    for (var i = 0; i < samples.length; i += sampleBlockSize) {
      leftChunk = leftChannel.subarray(i, i + sampleBlockSize);
      rightChunk = rightChannel.subarray(i, i + sampleBlockSize);
      const mp3buf = this.encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        this.mp3Data.push(mp3buf);
      }
    }

    let mp3buffer = this.encoder.flush();   //finish writing mp3
    if (mp3buffer.length > 0) {
      this.mp3Data.push(mp3buf);
    }

    const mp3Blob = new Blob(this.mp3Data, { type: 'audio/mp3' });
    this.mp3Data = []
    return {
      id   : Date.now(),
      blob : mp3Blob,
      url  : URL.createObjectURL(mp3Blob)
    }
  }
}