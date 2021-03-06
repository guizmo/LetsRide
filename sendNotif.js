var sendNotification = function(data) {
  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic NDJlNTQyMjMtOTg0OC00ZmJlLTkwMDEtYTdmZGIyZWNjOTNm"
  };

  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };

  var https = require('https');
  var req = https.request(options, function(res) {
    res.on('data', function(data) {
      console.log("Response:");
      console.log(JSON.parse(data));
    });
  });

  req.on('error', function(e) {
    console.log("ERROR:");
    console.log(e);
  });

  req.write(JSON.stringify(data));
  req.end();
};

var message = {
  app_id: "1b28e204-835f-4462-9c10-5b8eb31bfcc9",
  //contents: {"en": "My body in English"},
  //headings: {"en": "My title in English"},
  //included_segments: ["All"]
  include_player_ids: ['337092a2-4fa9-46df-9116-94fa3d701148'],
  data: {
    friendRequest:true,
    from: '337092a2-4fa9-46df-9116-94fa3d701148',
    displayName:'Toto'
  },
  //url: 'www.google.com',
  template_id: '549bdde4-45ea-4197-8161-4255483695f0'

};

sendNotification(message);
