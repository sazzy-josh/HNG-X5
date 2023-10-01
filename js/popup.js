document.addEventListener("DOMContentLoaded", () => {
  // GET THE SELECTORS OF THE BUTTONS
  const startVideoButton = document.querySelector("#start_video");
  const stopVideoButton = document.querySelector("#stop_video");

  // adding event listeners

  startVideoButton.addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {action: "request_recording"},
        (response) => {
          if (!chrome.runtime.lastError) {
            console.log(response);
            return;
          } else {
          }
          return;
        },
      );
    });
  });

  stopVideoButton.addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {action: "stop_video"},
        (response) => {
          if (!chrome.runtime.lastError) {
            console.log(response);
            return;
          }
          return;
        },
      );
    });
  });
});
