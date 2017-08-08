(function () {
    var AlertLive = function () {
    };

    var Param = {
        'clientId': 'qvr80zol9glws9vufdzujixvqg0oqs',
        'redirectUri': 'https://cbilfoloagcnhpgpjhojjfigjdpoflmg.chromiumapp.org/oauth2',
        'Streamers': []
    }

    AlertLive.prototype.getUserFollowedChannels = async function (user) {
        Param.Streamers = [];
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.twitch.tv/kraken/users/' + user + '/follows/channels?client_id=' + Param.clientId + '?&limit=100', true);
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
                            if (Streamer.name == "twitchstreamerss") {
                                console.log('');
                            }
                            Param.Streamers.push(Streamer);
                            if (Param.Streamers.length == follows.follows.length - 1) {
                                Param.Streamers = Param.Streamers.sort(function (a, b) {
                                    return b.isLive - a.isLive || b.viewers - a.viewers || b.name - a.name;
                                })
                                resolve(Param.Streamers);
                            }
                        }
                        xxhr[i].send();
                    })(i);
                }
            }
            xhr.send();
        })
    }

    AlertLive.prototype.IsOnline = async function (user) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.twitch.tv/kraken/streams/' + user + '?&client_id=' + Param.clientId);
            xhr.onreadystatechange = function () {
                if (xhr.readyState != 4 || xhr.status != 200) return;
                var stream = JSON.parse(xhr.responseText).stream;
                if (stream) resolve(true);
                else resolve(false);
            }
            xhr.send();
        })
    }
    window.AlertLive = new AlertLive();
})();