// Get UI elements from the DOM
let mediaElement = document.querySelector('audio');
const audioFile = document.querySelector('#audio_file');
const gainControl = document.querySelector('#volume');
const panControl = document.querySelector('#pan');
const playButton = document.querySelector('#play_button');
const cutButton = document.querySelector('#cut_button');

// Setup the AudioContext
const audioContext = new window.AudioContext();
// let sourceAudioNode; // Set by audioFile.onchange.
let audioBuffer;
let bufferSourceNode;
let playbackStartTime = 0; // When was the last time playback started?
let playbackOffset = 0; // How far into the buffer have we played so far?

// listen for changes to the input sound file
audioFile.onchange = async function() {
  if (this.files.length) { // Only set the file if a file was chosen.
    var files = this.files;
    var file = URL.createObjectURL(files[0]);
    mediaElement.src = file;
    playButton.removeAttribute('disabled');
    setStatePaused();

    // Arm the audioContext if it is suspended. (It typically is upon page load.)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // fetch the audio file and decode the data
    const arrayBuffer = await files[0].arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    console.log({ audioBuffer });
  }
};

mediaElement.addEventListener('canplay', function() {
  console.log('canplay triggered');
});

// play/pause audio
playButton.addEventListener('click', function() {
  const setToPlayingState = this.getAttribute('aria-checked') === 'true' ? false : true;
  if (setToPlayingState) { // Start playing if currently paused
    playbackStartTime = audioContext.currentTime;
    console.log('Play at ', playbackOffset, ', currentTime: ', audioContext.currentTime);
    playAudioBufferAtOffset(playbackOffset);
    setStatePlaying();
  } else { // no need to check if currently playing. No harm in calling .stop() again. // if (this.dataset.playing === 'true') {
    playbackOffset += audioContext.currentTime - playbackStartTime;
    console.log('Pause at ', playbackOffset);
    bufferSourceNode.stop();
    setStatePaused();
  }
}, false);

// Gain node
const gainNode = new GainNode(audioContext, { gain: 0.5 });
gainControl.addEventListener('input', function() {
  gainNode.gain.value = this.value;
  console.log('Gain set: ', this.value);
}, false);

// Pan node
const panNode = new StereoPannerNode(audioContext, { pan: 0 });
panControl.addEventListener('input', function() {
  panNode.pan.value = this.value;
  console.log('Pan set: ', this.value);
}, false);

// Connect our graph. This works fine, even if the media file changes.
const sourceAudioNode = new MediaElementAudioSourceNode(audioContext, { mediaElement });
const effectsNodeChain = gainNode.connect(panNode).connect(audioContext.destination);
// sourceAudioNode.connect(gainNode).connect(panNode).connect(audioContext.destination);


function setStatePaused() {
  playButton.innerText = 'Play';
  playButton.dataset.playing = 'false';
  playButton.setAttribute( 'aria-checked', 'false' );
}

function setStatePlaying() {
  playButton.innerText = 'Pause';
  playButton.dataset.playing = 'true';
  playButton.setAttribute( 'aria-checked', 'true' );
}

// Creates a AudioBufferSourceNode and starts playing from the given time.
async function playAudioBufferAtOffset(time) {
  bufferSourceNode = new AudioBufferSourceNode(audioContext, {
    buffer: audioBuffer,
    sampleRate: audioContext.sampleRate,
    loop: false,
    playbackRate: 1
  });

  // when track ends, reset playback state & controls
  bufferSourceNode.onended = handleBufferEnded;
  bufferSourceNode.connect(effectsNodeChain);
  bufferSourceNode.start(0, time);
}


function handleBufferEnded() {
  // Only respond if the buffer ended naturally; ie, wasn't stopped by Pause button.
  if (playButton.dataset.playing === 'true') { // If button still shows "Play", then buffer ran out of samples
    console.log('Playback ended at currentTime: ', audioContext.currentTime);
    setStatePaused(); // Reset controls to show "Play"
    playbackStartTime = 0;
    playbackOffset = 0; // Reset start offset so that the next "Play" starts from the beginning.
  }
}
