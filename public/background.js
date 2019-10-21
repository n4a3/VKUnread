// runs on the installation
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      VKUIsEnabled: true
    });

    chrome.storage.sync.set({
      users: []
    });
  }
});

let isEnabledForAll;
let users;

function setVars() {
  chrome.storage.sync.get('VKUIsEnabled', res => {
    const data = res.VKUIsEnabled;
    if (data === false || data === true) {
      isEnabledForAll = data;
    }
  });
  chrome.storage.sync.get('users', res => {
    const data = res.users;
    if (Array.isArray(data)) {
      users = data;
    }
  });
}

function cancelCheck(string) {
  if (isEnabledForAll) {
    if (string.includes('a_mark_read')) {
      let doUnread = true;
      while (doUnread) {
        users.forEach(user => {
          if (string.includes(`peer=${user.id}`) && !user.isEnabled) {
            doUnread = false;
          }
        });
        break;
      }
      return doUnread;
    }
  } else {
    let doUnread = false;
    while (!doUnread) {
      users.forEach(user => {
        if (
          user.isEnabled &&
          string.includes(`peer=${user.id}`) &&
          string.includes('a_mark_read')
        ) {
          doUnread = true;
        }
      });
      break;
    }
    return doUnread;
  }
}

function callback(details) {
  let bytes = undefined;
  try {
    bytes = details.requestBody.raw[0].bytes;
  } catch {
    return;
  }
  if (bytes) {
    const string = String.fromCharCode.apply(null, new Uint8Array(bytes));
    if (cancelCheck(string)) {
      return {
        cancel: true
      };
    }
  }
}

const urls = { urls: ['*://vk.com/al_im.php'] };

const perms = ['blocking', 'requestBody'];

// entry init
(() => {
  setVars();
  chrome.storage.onChanged.addListener(() => {
    chrome.webRequest.onBeforeRequest.removeListener(callback);
    setVars();
    chrome.webRequest.onBeforeRequest.addListener(callback, urls, perms);
  });
  chrome.webRequest.onBeforeRequest.addListener(callback, urls, perms);
})();
