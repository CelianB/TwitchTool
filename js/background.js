const username = document.querySelector('#username');
const search = document.querySelector('#search');
const ListStreams = document.querySelector('.streamers');
var StreamList;

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

async function Update(Username) {
    var Streams = await AlertLive.getUserFollowedChannels(Username).then(function (val) {
        StreamList = val;
        val.forEach(function (Streamer) {
            BuildList(Streamer);
        }, this);
        chrome.storage.local.get('streamer', (r) => {
            val.forEach(function (Streamer, i) {
                if (r.streamer.indexOf(Streamer.name) !== -1) {
                    ListStreams.children[i].getElementsByClassName("notifdiv")[0].firstChild.src = '../img/alarmOFF.png';
                }
            }, this);
        });
        setInterval(function () { updateLives(StreamList) }, 6000);
    });
}

function BuildList(Streamer) {
    var li = document.createElement("li");
    li.className = 'ripple';
    var img = document.createElement('img');
    img.src = Streamer.img;
    img.style.cursor = 'pointer';
    var divText = document.createElement('div');
    divText.style.width = '95%';
    divText.style.cursor = 'pointer';
    var spanName = document.createElement('span');
    spanName.className = 'name';
    spanName.textContent = Streamer.display_name;
    var spanDesc = document.createElement('span');
    spanDesc.className = 'descr';
    spanDesc.textContent = "OFFLINE";
    var divNotif = document.createElement('div');
    divNotif.className = 'notifdiv';
    var Notif = document.createElement('img');
    Notif.src = '../img/alarmON.png';
    Notif.style.cursor = 'pointer';
    Notif.style.marginTop = '-8px';
    Notif.onclick = function () {
        if (this.src.indexOf("OFF.png") != -1) {
            //si OFF 
            this.src = '../img/alarmON.png';
            //delete var;
            deleteNoNotif(Streamer.name)
        }
        else {
            this.src = '../img/alarmOFF.png';
            addNonotif(Streamer.name)
        }
    }
    if (Streamer.isLive) {
        spanName.textContent += ' [LIVE] sur ' + Streamer.game + ' (' + Streamer.viewers + ' viewers)';
        spanDesc.textContent = Streamer.description;
        spanDesc.title = Streamer.description;
        li.className += " live";
        divText.onclick = function () { OpenStream(Streamer.name) };
        img.onclick = function () { OpenStream(Streamer.name) };
    }
    else li.style.backgroundColor='silver';
    divText.appendChild(spanName);
    divText.appendChild(document.createElement("br"));
    divText.appendChild(spanDesc);
    divNotif.appendChild(Notif);
    li.appendChild(img);
    li.appendChild(divText);
    li.appendChild(divNotif);
    ListStreams.appendChild(li);
}
function OpenStream(userName) {
    chrome.tabs.create({ url: 'https://www.twitch.tv/' + userName }, function (tab) { });
}
function deleteNoNotif(name) {
    chrome.storage.local.get('streamer', (r) => {
        var streamer = r.streamer;
        streamer.splice(streamer.indexOf(name), 1);
        chrome.storage.local.set({ streamer: streamer });
    });
}
function addNonotif(name) {
    chrome.storage.local.get('streamer', (r) => {
        var streamer = r.streamer;
        if (streamer.indexOf(name) == -1) {
            streamer.push(name)
            chrome.storage.local.set({ streamer: streamer });
        }
    });
}
function updateLives(streamers) {
    var Offlines = [];
    ListStreams.querySelectorAll('.ripple:not(.live)').forEach((elem) => {
        Offlines.push(elem.getElementsByClassName('name')[0].innerText);
    });
    var test=true;
    streamers.forEach(function (e) {
        if (Offlines.indexOf(e.name) !== -1) {
            var Live = AlertLive.IsOnline(e.name).then(function (isLive) {
                if (isLive) {
                   // chrome.browserAction.setBadgeText({ "text": e.display_name + " est en live !" });
                    var opt = {
                        type: "basic",
                        title: e.display_name,
                        message: e.display_name + " est en live !",
                        //iconUrl: e.img,
                        iconUrl: '../img/icon64.png',
                        isClickable: true
                    };
                    chrome.notifications.create('notifyON', opt, function (id) { });
                }
            });
        }
    });
}