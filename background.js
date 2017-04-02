// TODO: cleanup this page
var devtools = null;

const devToolsListener = function(message, sender, sendResponse) {
  console.log(message);
};

// might need to change this to be inside onConnect, and on devtools side
// pass the port to panel
chrome.runtime.onMessage.addListener(devToolsListener);
chrome.runtime.onConnect.addListener(function(port) {
  // port.onMessage.addListener(devToolsListener);
  devtools = port;
  // assign the listener function to a variable so we can remove it later
  // add the listener
  if (port.name == "devtools-page") {
    if (openCount == 0) {
      console.log("DevTools window opening.");
    }

    openCount++;
    port.onDisconnect.addListener(function(port) {
      openCount--;
      if (openCount == 0) {
        console.log("Last DevTools window closing.");
      }
    });
  }
});