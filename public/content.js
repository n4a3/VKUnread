const s = document.createElement('script');
s.src = chrome.extension.getURL('injected.js');
(document.head || document.documentElement).appendChild(s);
s.parentNode.removeChild(s);

chrome.runtime.onMessage.addListener(message => {
  if (message.action === 'VKU_NOTIFICATION') {
    const event = new CustomEvent('VKU_NOTIFICATION');
    window.dispatchEvent(event);
  }
});
