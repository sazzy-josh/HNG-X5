console.log("Hi, I have been injected this motherfucker!!!");

// random id generator
let randomId = (len = 10) => {
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij012345678".split("");
  let id = "";
  for (let i = 0; i < len; i++) {
    const rand = Math.floor(Math.random() * char.length);
    id += char[rand];
  }
  return id;
};

var recorder = null;
var chunks = [];
var videoId = randomId();
var API_BASE_URL = `https://seashell-app-4jicj.ondigitalocean.app/api`;

async function streamChunksToServer(chunk) {
  if (chunk.length > 0) {
    const videoBlob = new Blob(chunks, {
      type: chunk[0]?.type,
    });
    const formData = new FormData();
    formData.append("blob", videoBlob);
    formData.append("videoId", videoId);

    try {
      // Send the FormData in a POST request
      const url = `${API_BASE_URL}/video/stream`;
      const req = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const result = await req.json();
      if (req.ok) {
        setTimeout(() => {
          window.open("https://www.bentoafrica.com", "_blank");
        }, 2000);
      }
      console.log(`Stream response: ${result?.message}`);
    } catch (e) {
      console.error(`Something went wrong Streaming: ${e?.message}`);
    }
  } else {
    console.info(`Streaming chunk is empty.`);
  }
}

function onAccessApproved(stream) {
  recorder = new MediaRecorder(stream);

  recorder.start();

  recorder.onstop = async function () {
    stream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
      }
    });
    // Send the chunks to the backend
    await streamChunksToServer();
  };

  recorder.ondataavailable = async function (event) {
    console.log(event);
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
    // stream to backend
    const chunk = [event.data];
    await streamChunksToServer(chunk);
    console.log({chunk}, "chunks");
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "request_recording") {
    console.log("requesting recording");

    sendResponse(`processed: ${message.action}`);

    navigator.mediaDevices
      .getDisplayMedia({
        audio: true,
        video: {
          width: 1280,
          height: 720,
        },
      })
      .then((stream) => {
        onAccessApproved(stream);
      });
  }

  if (message.action === "stopvideo") {
    console.log("stopping video");
    sendResponse(`processed: ${message.action}`);
    if (!recorder) return console.log("no recorder");

    recorder.stop();
  }
});
