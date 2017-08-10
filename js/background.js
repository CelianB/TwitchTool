const username = document.querySelector('#username');
const search = document.querySelector('#search');
const ListStreams = document.querySelector('.streamers');
var StreamList;

chrome.storage.local.get(['username', 'allowNotification', 'notification', 'live'], res => {
    if (res.allowNotification || !res.hasOwnProperty('allowNotification'))
        res.allowNotification = true;
});

username.onkeydown = e => {
    if (e.keyCode == 13) SaveUserName(username.value);
};

search.onclick = () => SaveUserName(username.value);

window.onload = () => {
    chrome.storage.local.get('TwitchUserName', r => {
        username.value = r.TwitchUserName;
        Update(r.TwitchUserName);
    });
}
const SaveUserName = username => {
    if (username) {
        chrome.storage.local.set({ 'TwitchUserName': username });
        Update(username);
    }
}
async function Update(Username) {
    var Streams = await AlertLive.getUserFollowedChannels(Username).then(val => {
        StreamList = val;
        val.forEach(Streamer => BuildList(Streamer), this);
        chrome.storage.local.get('streamer', (r) => {
            val.forEach((Streamer, i) => {
                if (r.streamer.indexOf(Streamer.name) !== -1)
                    ListStreams.children[i].getElementsByClassName("notifdiv")[0].firstChild.src = '../img/alarmOFF.png';
            }, this);
        });
    });
}

const BuildList = Streamer => {
    var li = document.createElement("li");
    li.className = 'stream';
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
    Notif.onclick = () => {
        if (this.src.indexOf("OFF.png") != -1) {
            this.src = '../img/alarmON.png';
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
        divText.onclick = () => OpenStream(Streamer.name);
        img.onclick = () => OpenStream(Streamer.name);
    }
    else li.style.backgroundColor = '#e2e0e0';
    divText.appendChild(spanName);
    divText.appendChild(document.createElement("br"));
    divText.appendChild(spanDesc);
    divNotif.appendChild(Notif);
    li.appendChild(img);
    li.appendChild(divText);
    li.appendChild(divNotif);
    ListStreams.appendChild(li);
}
const OpenStream = userName => chrome.tabs.create({ url: 'https://www.twitch.tv/' + userName });

const deleteNoNotif = name => {
    chrome.storage.local.get('streamer', (r) => {
        var streamer = r.streamer;
        streamer.splice(streamer.indexOf(name), 1);
        chrome.storage.local.set({ streamer: streamer });
    });
}
const addNonotif = name => {
    chrome.storage.local.get('streamer', (r) => {
        var streamer = r.streamer;
        if (streamer.indexOf(name) == -1) {
            streamer.push(name)
            chrome.storage.local.set({ streamer: streamer });
        }
    });
}
