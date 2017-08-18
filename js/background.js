const username = document.querySelector('#username');
const search = document.querySelector('#search');
const allowNotif=document.querySelector('#allowNotif');
const ListStreams = document.querySelector('.streamers');
var StreamList;

chrome.storage.local.get(['username', 'allowNotification', 'notification', 'live'], res => {
    if (res.allowNotification || !res.hasOwnProperty('allowNotification'))
        res.allowNotification = true;
});

username.onkeydown = e => {
    if (e.keyCode == 13) SaveUserName(username.value);
};

allowNotif.onchange = that => {
    let notifON=that.target.checked
    chrome.storage.local.set({ 'TwitchToolNotif':notifON});
    for (var elem of ListStreams.children){
        if (notifON)elem.getElementsByClassName("notifdiv")[0].firstChild.src = '../img/alarmON.png';
        else elem.getElementsByClassName("notifdiv")[0].firstChild.src = '../img/alarmOFF.png';
    }
};

search.onclick = () => SaveUserName(username.value);


window.onload = () => {
    chrome.storage.local.get('TwitchUserName', r => {
        if (r.TwitchUserName===undefined)
            r.TwitchUserName="Twitch";
        username.value = r.TwitchUserName;
        Update(r.TwitchUserName);
    });
    chrome.storage.local.get('TwitchToolNotif', r => {
        if (r.TwitchToolNotif===undefined)r.TwitchToolNotif=true;
        allowNotif.checked=r.TwitchToolNotif;
    });
}
const SaveUserName = username => {
    if (username) {
        chrome.storage.local.set({ 'TwitchUserName': username });
        Update(username);
    }
}
async function Update(Username) {
    ListStreams.innerHTML='';
    var Streams = await AlertLive.getUserFollowedChannels(Username).then(val => {
        StreamList = val;
        val.forEach(Streamer => BuildList(Streamer), this);
        chrome.storage.local.get('streamer', (r) => {
            val.forEach((Streamer, i) => {
                if (r.streamer!=undefined && r.streamer.indexOf(Streamer.name) !== -1)
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
    Notif.onclick = (e) => {
        if (e.path[0].src.indexOf("OFF.png") != -1) {
            e.path[0].src = '../img/alarmON.png';
            deleteNoNotif(Streamer.name)
        }
        else {
            e.path[0].src= '../img/alarmOFF.png';
            addNonotif(Streamer.name)
        }
    }
    if (Streamer.isLive) {
        spanName.textContent += ' [LIVE] sur ' + Streamer.game + ' (' + Streamer.viewers + ' viewers)';
        spanDesc.textContent = Streamer.description;
        spanDesc.title = Streamer.description;
        li.className += " live";
    }
    else li.style.backgroundColor = '#e2e0e0';
    divText.onclick = () => OpenStream(Streamer.name);
    img.onclick = () => OpenStream(Streamer.name);
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
        if (streamer==undefined)streamer=[];
        if (streamer.indexOf(name) == -1) {
            streamer.push(name)
            chrome.storage.local.set({ streamer: streamer });
        }
    });
}
