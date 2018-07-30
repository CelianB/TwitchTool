(function() {
  var AlertLive = function() {};
  var Param = {
    clientId: "qvr80zol9glws9vufdzujixvqg0oqs",
    redirectUri:
      "https://cbilfoloagcnhpgpjhojjfigjdpoflmg.chromiumapp.org/oauth2",
    notified: []
  };
  AlertLive.prototype.getUserFollowedChannels = user => {
    streamers = [];
    return new Promise(resolve => {
      var xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://api.twitch.tv/kraken/users/" +
          user +
          "/follows/channels?&limit=100&client_id=" +
          Param.clientId,
        true
      );
      xhr.onreadystatechange = () => {
        if (xhr.readyState != 4 || xhr.status != 200) return;
        var follows = JSON.parse(xhr.responseText);
        var xxhr = [];
        for (var i = 0; i < follows.follows.length; i++) {
          (i => {
            xxhr[i] = new XMLHttpRequest();
            xxhr[i].open(
              "GET",
              "https://api.twitch.tv/kraken/streams/" +
                follows.follows[i].channel.name +
                "?client_id=" +
                Param.clientId,
              true
            );
            xxhr[i].onreadystatechange = () => {
              if (xxhr[i].readyState != 4 || xxhr[i].status != 200) return;
              var stream = JSON.parse(xxhr[i].responseText);
              var Streamer = {
                display_name: follows.follows[i].channel.display_name,
                name: follows.follows[i].channel.name,
                img:
                  follows.follows[i].channel.logo ||
                  "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png",
                isLive: false,
                viewers: 0,
                notified: false
              };
              if (stream.stream && stream.stream.stream_type == "live") {
                Streamer.stratedAt = stream.stream.created_at;
                Streamer.isLive = true;
                Streamer.description = stream.stream.channel.status;
                Streamer.game = stream.stream.game;
                Streamer.viewers = stream.stream.viewers;
                if (Param.notified.indexOf(Streamer.name) !== -1)
                  Streamer.notified = true;
              } else {
                var y = Param.notified.indexOf(Streamer.name);
                if (y !== -1) Param.notified.splice(y, 1);
              }
              streamers.push(Streamer);
              if (streamers.length == follows.follows.length - 1) {
                streamers = streamers.sort((a, b) => {
                  return (
                    b.isLive - a.isLive ||
                    b.viewers - a.viewers ||
                    b.name - a.name
                  );
                });
                const IsOffLine = arg => arg.isLive == false;
                chrome.browserAction.setBadgeText({
                  text: (
                    streamers.length - streamers.filter(IsOffLine).length
                  ).toString()
                });
                resolve(streamers);
              }
            };
            xxhr[i].send();
          })(i);
        }
      };
      xhr.send();
    });
  };

  AlertLive.prototype.updateLives = Onlines => {
    chrome.storage.local.get("streamer", r => {
      var NoNotifStreamer = r.streamer;
      Onlines.forEach(e => {
        if (
          (NoNotifStreamer !== undefined ||
            NoNotifStreamer.indexOf(e.name) == -1) &&
          e.notified == false
        ) {
          let startDate = Date.parse(e.stratedAt);
          let date = new Date();
          let timeToAlert = date.setMinutes(date.getMinutes() - 10);
          console.log(timeToAlert);
          if (startDate > timeToAlert) {
            var opt = {
              type: "basic",
              title: e.display_name,
              message: e.display_name + " just started a live stream",
              //iconUrl: e.img,
              iconUrl: "../img/icon64.png",
              isClickable: true
            };
            chrome.notifications.create(e.name, opt);
          }
        }
      });
    });
  };
  chrome.notifications.onClicked.addListener(id => {
    chrome.tabs.create({ url: "https://www.twitch.tv/" + id });
  });

  AlertLive.prototype.Updator = () => {
    var IsOnline = stream => stream.isLive == true;
    chrome.storage.local.get("TwitchUserName", r => {
      AlertLive.prototype.getUserFollowedChannels(r.TwitchUserName).then(s => {
        chrome.storage.local.get("TwitchToolNotif", r => {
          if (r.TwitchToolNotif === undefined || r.TwitchToolNotif) {
            AlertLive.prototype.updateLives(s.filter(IsOnline));
          }
        });
      });
    });
  };
  setInterval(() => {
    AlertLive.prototype.Updator();
  }, 10000);
  window.AlertLive = new AlertLive();
})();
