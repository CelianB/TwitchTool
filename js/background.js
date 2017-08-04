const username = document.querySelector('#username');
const search = document.querySelector('#search');

chrome.storage.local.get(['username', 'allowNotification', 'notification', 'live'], function (res) {
    if (res.allowNotification || !res.hasOwnProperty('allowNotification'))
        res.allowNotification = true;
});


username.onkeydown = function (e) {
    if (e.keyCode == 13) {
        SaveUserName(username.value);
    }
};
search.onclick = function () {
    SaveUserName(username.value);
}

window.onload = function () {
    chrome.storage.local.get('TwitchUserName', (r) => {
        username.value = r.TwitchUserName;
        Update(r.TwitchUserName);
    });
}
function SaveUserName(Username) {
    if (Username) {
        chrome.storage.local.set({ 'TwitchUserName': Username });
        Update(Username);
    }
}

async function Update(Username){
   var Follows= await  AlertLive.getUserFollowedChannels(Username);
   console.log(Follows);
}