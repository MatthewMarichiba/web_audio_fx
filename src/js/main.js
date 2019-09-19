// Get UI elements from the DOM
let mediaElement = document.querySelector('audio');
const audioFile = document.querySelector('#audio_file');
const gainControl = document.querySelector('#volume');
const panControl = document.querySelector('#pan');
const playButton = document.querySelector('#play_button');
const cutButton = document.querySelector('#cut_button');

// Setup the AudioContext
const audioContext = new window.AudioContext();
let sourceAudioNode; // Init this when file is loaded.

// listen for changes to the input sound file
audioFile.onchange = function(){
  if (this.files.length) { // Only set the file if a file was chosen.
    var files = this.files;
    var file = URL.createObjectURL(files[0]);
    mediaElement.src = file;
    playButton.removeAttribute('disabled');
    resetFilePlayState();
  }
};

mediaElement.addEventListener('canplay', function() {
  console.log('canplay triggered');
  // sourceAudioNode = new MediaElementAudioSourceNode(audioContext, { mediaElement });
  // // sourceAudioNode = audioContext.createMediaElementSource(mediaElement);
  // sourceAudioNode.connect(gainNode).connect(panNode).connect(audioContext.destination);
});


// play/pause audio
playButton.addEventListener('click', function() {
  // check if context is in suspended state (autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const newPlayState = this.getAttribute('aria-checked') === 'true' ? false : true;
  this.setAttribute( 'aria-checked', newPlayState ? 'true' : 'false' );
  if (newPlayState) { // Start playing if currently paused
    console.log('Play');
    mediaElement.play();
    this.dataset.playing = 'true';
    playButton.innerText = 'Pause';
  } else if (this.dataset.playing === 'true') {
    console.log('Pause');
    mediaElement.pause();
    resetFilePlayState();
  }
}, false);

// if track ends
mediaElement.addEventListener('ended', () => {
  console.log('Playback ended');
  playButton.dataset.playing = 'false';
  playButton.setAttribute( 'aria-checked', 'false' );
  playButton.innerText = 'Play';
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
sourceAudioNode = new MediaElementAudioSourceNode(audioContext, { mediaElement });
sourceAudioNode.connect(gainNode).connect(panNode).connect(audioContext.destination);


function resetFilePlayState() {
  playButton.innerText = 'Play';
  playButton.dataset.playing = 'false';
  playButton.setAttribute( 'aria-checked', 'false' );
}
