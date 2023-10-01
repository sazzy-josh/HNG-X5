console.log("Hi, I have been injected whoopie!!!");

var recorder = null;
var chunks = [];

async function sendBase64ToEndpoint(base64data) {
  try {
    const response = await fetch("https://example.com/your-endpoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({base64data}),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const responseData = await response.json();
    setTimeout(() => {
      window.open("url-to-my-landing-page", "_blank");
    }, 2000);
    console.log("Response from server:", responseData);
  } catch (error) {
    console.error("Error sending base64 data:", error);
  }
}

//generates Chunks of data && sends data to BE
function sendChunksToBackend() {
  if (chunks.length > 0) {
    var reader = new FileReader();
    reader.onloadend = function () {
      var base64data = reader.result.split(",")[1];
      console.log("Sending chunk to backend:", base64data);

      // Send the base64 data to the endpoint
      sendBase64ToEndpoint(base64data);

      // Clear chunks after sending
      chunks = [];
    };
    reader.readAsDataURL(new Blob(chunks));
  }
}

function onAccessApproved(stream) {
  recorder = new MediaRecorder(stream);

  recorder.start();

  recorder.onstop = function () {
    stream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
      }
    });
    // Send the chunks to the backend
    sendChunksToBackend();
  };

  recorder.ondataavailable = function (event) {
    console.log(event);
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
    // let recordedBlob = event.data;
    // let url = URL.createObjectURL(recordedBlob);
    // console.log(url);

    // let a = document.createElement("a");

    // a.style.display = "none";
    // a.href = url;
    // a.download = "screen-recording.webm";

    // document.body.appendChild(a);
    // a.click();

    // document.body.removeChild(a);

    // URL.revokeObjectURL(url);
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
          width: 9999999999,
          height: 9999999999,
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
