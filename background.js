"use strict";

const activeTabs = {};

function updateIcon(tabId) {
  const color = activeTabs[tabId] ? "red" : "black";
  chrome.action.setIcon({ tabId, path: `images/${color}_16.png` });
}

function detachTab(tabId) {
  chrome.debugger.detach({ tabId: tabId }, function () {
    console.log("detached debugger to tab: " + tabId);
    delete activeTabs[tabId];
    updateIcon(tabId);
  });
}

function attachTab(tabId) {
  chrome.debugger.attach({ tabId: tabId }, "1.3", function () {
    console.log("attached debugger to tab: " + tabId);
    activeTabs[tabId] = true;
    updateIcon(tabId);
  });
}

chrome.action.onClicked.addListener(function callback(tab) {
  console.log("BrowserAction icon clicked. Attaching/detaching the tab.");
  const tabId = tab.id;
  activeTabs[tabId] ? detachTab(tabId) : attachTab(tabId);
});

chrome.tabs.onActivated.addListener(function callback(activeInfo) {
  updateIcon(activeInfo.tabId);
});

chrome.runtime.onMessage.addListener(
  function handleMessage(request, sender, sendResponse) {
    var tabId = sender.tab.id;
    if (!activeTabs[tabId]) return;
    console.log("received request from clientScript on active tab", request);
    dispatchNativeEvent(request, tabId);
  },
);

function dispatchNativeEvent(event, tabId) {
  let cmd;
  if (event.type.startsWith("mouse")) cmd = "Input.dispatchMouseEvent";
  else if (event.type.startsWith("touch")) cmd = "Input.dispatchTouchEvent";
  else if (
    event.type === "keyDown" ||
    event.type === "keyUp" ||
    event.type === "char" ||
    event.type === "rawKeyDown"
  )
    cmd = "Input.dispatchKeyEvent";
  else if (event.type === "beforeinput-is-trusted") cmd = "Input.insertText";
  else throw new Error("Illegal native event: ", event);
  chrome.debugger.sendCommand({ tabId: tabId }, cmd, event, function () {
    console.log("sendCommand", cmd, event);
  });
}
