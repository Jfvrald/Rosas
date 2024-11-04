const tracks = [
  {
    title: "Sining",
    artist: "Dionela feat Jay R",
    src: "track1.mp3",
    cover: "rose.jpg",
    bg: "bg1.png",
    color: "#C28F46",
  },
  {
    title: "Diwata",
    artist: "Abra ft. Chito Miranda",
    src: "track2.mp3",
    cover: "rose.jpg",
    bg: "bg2.png",
    color: "#9102ca",
  },
  {
    title: "I'll Always Love You",
    artist: "Michael Johnson",
    src: "track5.mp3",
    cover: "rose.jpg",
    bg: "bg5.png",
    color: "#2C4B88",
  },
];

let currentTrackIndex = 0;
let isPlaying = false;
const audio = new Audio(); // Pre-initialize audio element
const playPauseButton = document.getElementById("playPauseButton");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const currentTimeElem = document.getElementById("currentTime");
const totalTimeElem = document.getElementById("totalTime");
const innerSliderBar = document.querySelector(".inner_slider_bar");
const albumCover = document.getElementById("albumCover");
const player = document.querySelector(".player");

// Preload next track
function preloadNextTrack() {
  const nextIndex = (currentTrackIndex + 1) % tracks.length;
  const nextTrack = new Audio(tracks[nextIndex].src);
  nextTrack.preload = "auto";
}

function loadTrack(index) {
  const track = tracks[index];

  // Update UI elements immediately
  songTitle.textContent = track.title;
  songArtist.textContent = track.artist;
  albumCover.src = track.cover;
  document.body.style.backgroundImage = `url(${track.bg})`;
  player.style.borderColor = track.color;
  player.style.boxShadow = `-7px -6px 10px 5px ${track.color}1c, 6px 6px 10px 5px ${track.color}1c`;

  // Load audio source
  audio.src = track.src;
  audio.load(); // Force load the audio

  if (isPlaying) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          playPauseButton.textContent = "Pause";
          albumCover.classList.add("rotating");
        })
        .catch((error) => console.log("Playback failed:", error));
    }
  } else {
    playPauseButton.textContent = "Play";
    albumCover.classList.remove("rotating");
  }

  // Preload next track
  preloadNextTrack();
}

function togglePlayPause() {
  if (audio.paused) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          playPauseButton.textContent = "Pause";
          albumCover.classList.add("rotating");
          isPlaying = true;
        })
        .catch((error) => console.log("Playback failed:", error));
    }
  } else {
    audio.pause();
    playPauseButton.textContent = "Play";
    albumCover.classList.remove("rotating");
    isPlaying = false;
  }
}

function nextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  loadTrack(currentTrackIndex);
}

function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrackIndex);
}

// Optimized slider update with requestAnimationFrame
let animationFrameId;
function updateSlider() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = requestAnimationFrame(() => {
    const duration = audio.duration;
    const currentTime = audio.currentTime;

    if (duration) {
      const percentage = (currentTime / duration) * 100;
      innerSliderBar.style.width = percentage + "%";

      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      currentTimeElem.textContent = `${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;

      const totalMinutes = Math.floor(duration / 60);
      const totalSeconds = Math.floor(duration % 60);
      totalTimeElem.textContent = `${totalMinutes}:${
        totalSeconds < 10 ? "0" : ""
      }${totalSeconds}`;
    }
  });
}

// Debounced time setting function
let timeoutId;
function setTime(event) {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    const sliderBar = event.currentTarget;
    const rect = sliderBar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percentage = offsetX / sliderBar.clientWidth;
    audio.currentTime = percentage * audio.duration;
  }, 50); // 50ms debounce
}

// Initialize with the first track
window.addEventListener("load", () => {
  loadTrack(currentTrackIndex);
  audio.load(); // Ensure initial track is loaded
});

audio.addEventListener("timeupdate", updateSlider);
audio.addEventListener("ended", nextTrack);

playPauseButton.addEventListener("click", () => {
  if (audio.paused && audio.currentTime === 0) {
    loadTrack(currentTrackIndex);
  }
  togglePlayPause();
});

// Use event delegation for controls
const controls = document.querySelector(".controls");
controls.addEventListener("click", (e) => {
  if (e.target.classList.contains("next")) {
    nextTrack();
  } else if (e.target.classList.contains("prev")) {
    prevTrack();
  }
});

const slider = document.querySelector(".slider_bar");
slider.addEventListener("click", setTime);
