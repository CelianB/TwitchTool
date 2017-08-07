const username = document.querySelector('#username');
const search = document.querySelector('#search');
const ListStreams = document.querySelector('.streamers');

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
        val.forEach(function (Streamer) {
            BuildList(Streamer);
        }, this);
    })
}

function BuildList(Streamer) {
    var li = document.createElement("li");
    li.className = 'ripple';
    var img = document.createElement('img');
    img.src = Streamer.img;
    img.style.cursor='pointer';
    var divText = document.createElement('div');
    divText.style.width = '95%';
    divText.style.cursor='pointer';
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
    Notif.style.cursor='pointer';
    Notif.style.marginTop= '-8px';
    Notif.onclick=function(){
        if (this.src.indexOf("OFF.png")!=-1){
            //si OFF 
            this.src= '../img/alarmON.png';
            //delete var;
            deleteNoNotif(Streamer.name)
        }
        else{
            this.src= '../img/alarmOFF.png';
            addNonotif(Streamer.name)
        }
    }
    if (Streamer.isLive) {
        spanName.textContent += ' [LIVE] sur ' + Streamer.game + ' (' + Streamer.viewers + ' viewers)';
        spanDesc.textContent = Streamer.description;
        spanDesc.title=Streamer.description;
        li.className+=" live";
        divText.onclick =function(){OpenStream(Streamer.name)} ;
        img.onclick =function(){OpenStream(Streamer.name)} ;
    }
    divText.appendChild(spanName);
    divText.appendChild(document.createElement("br"));
    divText.appendChild(spanDesc);
    divNotif.appendChild(Notif);
    li.appendChild(img);
    li.appendChild(divText);
    li.appendChild(divNotif);
    ListStreams.appendChild(li);
}
function OpenStream(userName){
    chrome.tabs.create({ url: 'https://www.twitch.tv/' + userName }, function (tab) { });
}
function deleteNoNotif(name){

}

function addNonotif(name){
    chrome.storage.local.get({nameKey: []}, function (result) {
    chrome.storage.local.set({nameKey: nameKey}, function () {
        chrome.storage.local.get('nameKey', function (result) {
            console.log(result.nameKey)
        });
    });
});
}