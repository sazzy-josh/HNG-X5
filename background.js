chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    tab.url?.startsWith("chrome://") ||
    !tab.url ||
    (changeInfo.status === "complete" && /^http/.test(tab.url))
  ) {
    chrome.scripting.executeScript(
      {
        target: {tabId},
        func: injectScript,
      },
      () => {
        console.log("script injected");
      },
    );
  }
});

function injectScript() {
  // Check if the script has been injected before
  chrome.storage.local.get("injected", ({injected}) => {
    if (!injected) {
      // Inject the script
      chrome.scripting
        .insertCSS({
          target: {tabId: chrome.devtools.inspectedWindow.tabId},
          files: ["./styles.css"],
        })
        .then(() => {
          console.log("CSS injected");
        })
        .catch((err) => {
          console.error(err, "error injecting CSS");
        });

      chrome.scripting
        .executeScript({
          target: {tabId: chrome.devtools.inspectedWindow.tabId},
          files: ["./content.js"],
        })
        .then(() => {
          console.log("script injected");
          // Mark script as injected
          chrome.storage.local.set({injected: true});
        })
        .catch((err) => {
          console.error(err, "error injecting script");
        });
    }
  });
}
