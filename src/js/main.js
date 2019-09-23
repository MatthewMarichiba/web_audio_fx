'use strict';
import keyMap from './key_map.js';
import Cutter from './cutter.js';

// Get UI elements from the DOM
const audioFile = document.querySelector('#audio_file');
const fileName = document.querySelector('#fileName');
const selectFileButton = document.querySelector('#select_file_button');
const gainControl = document.querySelector('#volume');
const panControl = document.querySelector('#pan');
const playButton = document.querySelector('#play_button');
const cutButton = document.querySelector('#cut_button');

// Setup the AudioContext
const audioContext = new window.AudioContext();
let effectsNodeChain;
let audioBuffer;
let bufferSourceNode;
let playbackStartTime = 0; // When was the last time playback started?
let playbackOffset = 0; // How far into the buffer have we played so far?

// listen for changes to the input sound file
selectFileButton.onclick = (e) => {
  audioFile.click();
};
audioFile.onchange = async function() {
  if (this.files.length) { // Only set the file if a file was chosen.
    var files = this.files;
    console.log(files);
    fileName.innerText = files[0].name;
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
  } else {
    togglePlaybackState({ forcePause: true });
    setStatePaused();
    fileName.innerText = '';
    playButton.setAttribute('disabled', true);
  }
};

// play/pause audio
playButton.onclick = togglePlaybackState;
function togglePlaybackState(options = { forcePlay: false, forcePause: false }) {
  const toggleToPlayingState = playButton.getAttribute('aria-checked') === 'true' ? false : true;
  // Start playing if: currently paused or forcePlay is set.  forcePause==true triggers the "else" condition
  if ((toggleToPlayingState || options.forcePlay) && !options.forcePause) {
    playbackStartTime = audioContext.currentTime;
    console.log('Play at ', playbackOffset, ', currentTime: ', audioContext.currentTime);
    playAudioBufferAtOffset(playbackOffset);
    setStatePlaying();
  } else { // no need to check if currently playing. No harm in calling .stop() again. // if (playButton.dataset.playing === 'true') {
    playbackOffset += audioContext.currentTime - playbackStartTime;
    console.log('Pause at ', playbackOffset);
    bufferSourceNode.stop();
    setStatePaused();
  }
}

// Gain node
const gainNode = new GainNode(audioContext, { gain: 0.5 });
gainControl.oninput = function() {
  gainNode.gain.value = this.value;
  console.log('Gain set: ', gainNode.gain.value);
};

// Pan node
const panNode = new StereoPannerNode(audioContext, { pan: 0.0 });
panControl.oninput = function() {
  panNode.pan.value = this.value;
  console.log('Pan set: ', this.value);
};

// Cutter Node
const cutterNode = new Cutter(audioContext);

// Assign keyboard mappings to keyboard events
function activateKeyMappings() {
  // Map keyboard (not MIDI) key presses
  document.onkeydown = document.onkeyup = (e) => {
    const keydown = e.type === 'keydown';
    const keyup = e.type === 'keyup';
    const key = e.key.toLowerCase();

    switch (key) {
      case keyMap.cutter.trigger.keyboard: {
        if (keydown) {
          console.log('cut key down');
          cutterNode.on();
        } else {
          cutterNode.off();
          console.log('cut key up');
        }
        break;
      }
      case keyMap.play_pause.toggle.keyboard: {
        if (keydown) {
          togglePlaybackState();
        }
        break;
      }
      default: {
        break;
      }
    }
  }
}

cutButton.onmousedown = (e) => {
  console.log('Cut on! ', e);
  cutterNode.on();
}
cutButton.onmouseup = (e) => {
  console.log('Cut off! ', e);
  cutterNode.off();
}

activateKeyMappings();
// Connect our graph. This works fine, even if the media file changes.
cutterNode.connect(gainNode).connect(panNode).connect(audioContext.destination);
effectsNodeChain = cutterNode; // A generic name for whatever node happens to be the head of the FX chain

function setStatePaused() {
  playButton.innerText = 'Play (P)';
  playButton.dataset.playing = 'false';
  playButton.setAttribute( 'aria-checked', 'false' );
}

function setStatePlaying() {
  playButton.innerText = 'Pause (P)';
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
