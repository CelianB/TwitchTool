(function () {
    var AlertLive = function () { };
    var Param = {
        'clientId': 'qvr80zol9glws9vufdzujixvqg0oqs',
        'redirectUri': 'https://cbilfoloagcnhpgpjhojjfigjdpoflmg.chromiumapp.org/oauth2',
    }
    AlertLive.prototype.getUserFollowedChannels = user => {
        streamers=[];
        return new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.twitch.tv/kraken/users/' + user + '/follows/channels?client_id=' + Param.clientId + '?&limit=100', true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState != 4 || xhr.status != 200) return;
                var follows = JSON.parse(xhr.responseText);
                var xxhr = [];
                for (var i = 0; i < follows.follows.length; i++) {
                    ((i) => {
                        xxhr[i] = new XMLHttpRequest();
                        xxhr[i].open('GET', 'https://api.twitch.tv/kraken/streams/' + follows.follows[i].channel.name + '?client_id=' + Param.clientId, true);
                        xxhr[i].onreadystatechange = () => {
                            if (xxhr[i].readyState != 4 || xxhr[i].status != 200) return;
                            var stream = JSON.parse(xxhr[i].responseText);
                            var Streamer = {
                                display_name: follows.follows[i].channel.display_name,
                                name: follows.follows[i].channel.name,
                                img: follows.follows[i].channel.logo || 'https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png',
                                isLive: false,
                                viewers: 0
                            }
                            if (stream.stream) {
                                Streamer.isLive = true;
                                Streamer.description = stream.stream.channel.status;
                                Streamer.game = stream.stream.game;
                                Streamer.viewers = stream.stream.viewers;
                            }
                            streamers.push(Streamer);
                            if (streamers.length == follows.follows.length - 1) {
                                streamers = streamers.sort((a, b) => {
                                    return b.isLive - a.isLive || b.viewers - a.viewers || b.name - a.name;
                                })
                                resolve(streamers);
                            }
                        }
                        xxhr[i].send();
                    })(i);
                }
            }
            xhr.send();
        })
    }

    AlertLive.prototype.IsOnline = user => {
        return new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.twitch.tv/kraken/streams/' + user + '?&client_id=' + Param.clientId);
            xhr.onreadystatechange = () => {
                if (xhr.readyState != 4 || xhr.status != 200) return;
                var stream = JSON.parse(xhr.responseText).stream;
                if (stream) resolve(true);
                else resolve(false);
            }
            xhr.send();
        })
    }

    AlertLive.prototype.updateLives = (Offlines) => {
        chrome.storage.local.get('streamer', (r) => {
            var streamer = r.streamer;
            Offlines.forEach(e => {
                if (streamer.indexOf(e.name) == -1) {
                    var Live = AlertLive.prototype.IsOnline(e.name).then(isLive => {
                        if (isLive) {
                            chrome.browserAction.setBadgeText({ "text": "" });
                            var opt = {
                                type: "basic",
                                title: e.display_name,
                                message: e.display_name + " est en live !",
                                iconUrl: e.img,
                                //iconUrl: '../img/icon64.png',
                                isClickable: true
                            };
                            chrome.notifications.create('notifyON', opt, function (id) { });
                        }
                    });
                }
            });
        });
    }
    setInterval(() => {
        var Isliveonly = stream => stream.isLive == false;
        chrome.storage.local.get('TwitchUserName', r => {
            AlertLive.prototype.getUserFollowedChannels(r.TwitchUserName).then(s=>{
                 AlertLive.prototype.updateLives(s.filter(Isliveonly));
                }
            );
        });
       
    }, 60000);
    window.AlertLive = new AlertLive();
})();