(function () {
    var AlertLive = function () {
    };

    var Param = {
        'clientId': 'qvr80zol9glws9vufdzujixvqg0oqs',
        'redirectUri': 'https://cbilfoloagcnhpgpjhojjfigjdpoflmg.chromiumapp.org/oauth2',
        'Streamers':[]
    }

    AlertLive.prototype.getViewers = function (user) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.twitch.tv/kraken/streams/' + user + '&client_id=' + this.clientId);
            xhr.onreadystatechange = function () {
                if (xhr.readyState != 4 || xhr.status != 200) return;
                var stream = JSON.parse(xhr.responseText).stream;
                if (stream) resolve(stream.viewers);
                else resolve(0);
            }
            xhr.send();
        })
    }

    AlertLive.prototype.getUserFollowedChannels = async function (user) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.twitch.tv/kraken/users/' + user + '/follows/channels?client_id=' + Param.clientId, true);
            //xhr.open('GET', 'https://api.twitch.tv/kraken/users/' + user+ '/follows/channels?client_id=' + AlertLive.clientId+"?limit=100", true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState != 4 || xhr.status != 200) return;
                var follows = JSON.parse(xhr.responseText);
                var xxhr = [];
                for (var i = 0; i < follows.follows.length; i++) {
                    (function (i) {
                        xxhr[i] = new XMLHttpRequest();
                        xxhr[i].open('GET', 'https://api.twitch.tv/kraken/streams/' + follows.follows[i].channel.name + '?client_id=' + Param.clientId, true);
                        xxhr[i].onreadystatechange = function () {
                            if (xxhr[i].readyState != 4 || xxhr[i].status != 200) return;
                            var stream = JSON.parse(xxhr[i].responseText);
                            var Streamer = {
                                name: follows.follows[i].channel.name,
                                img: follows.follows[i].channel.logo,
                                notif: true,
                                isLive:false,
                                viewers:0
                            }
                            if (stream.stream != null) {
                                Streamer.isLive = true;
                                Streamer.description=stream.stream.channel.status;
                                Streamer.game=stream.stream.game;
                                Streamer.viewers=stream.stream.viewers;
                            }
                            Param.Streamers.push(Streamer);
                        }
                        xxhr[i].send();
                    })(i);
                }
                Param.Streamers=Param.Streamers.sort(function(a,b){
                    return b.viewers - a.viewers;
                })
                resolve(Param.Streamers);
            }
            xhr.send();
        })
    }

    window.AlertLive = new AlertLive();
})();