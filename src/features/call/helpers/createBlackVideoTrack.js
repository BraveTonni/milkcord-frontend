// helper: creates a black video track via canvas.captureStream
export function createBlackVideoTrack({ width = 640, height = 480, fps = 15 } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  const interval = setInterval(() => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
  }, 1000 / fps);

  const stream = canvas.captureStream(fps);
  const track = stream.getVideoTracks()[0];

  const origStop = track.stop.bind(track);
  track.stop = () => {
    clearInterval(interval);
    origStop();
  };

  track._isBlackPlaceholder = true;
  return track;
}
