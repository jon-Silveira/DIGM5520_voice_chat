// code from https://dev.to/hosseinmobarakian/create-simple-voice-chat-app-with-nodejs-1b70
/* Create a simple voice chat app with nodejs - h_mobarakian
https://dev.to/hosseinmobarakian/create-simple-voice-chat-app-with-nodejs-1b70

https://github.com/js12lh/DIGM5520_voice_chat/tree/main/2%20SocketIO

This tutorial uses the server to transfer small packets of audio data. Unlike peer.js it worked
immediately though there was a significant delay in the information transfer. The client uses 
the browser’s navigator.mediaDevices.getUserMedia to get the audio data and fileReader() to 
convert it into a base64String that can be sent over the socket server. But the conversion and 
the transfer over the server adds a large delay this makes this method of sending audio very 
impractical for a voice chat feature.
*/


const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const http = require("http").Server(app);
const io = require("socket.io")(http);

//To holding users information 
const socketsStatus = {};

//config and set handlebars to express
const customHandlebars = handlebars.create({ layoutsDir: "./views" });

app.engine("handlebars", customHandlebars.engine);
app.set("view engine", "handlebars");

//enable user access to public folder 
app.use("/files", express.static("public"));

//renders 
app.get("/home" , (req , res)=>{
    res.render("index");
});

// When the socket is connected 
// 
io.on("connection", function (socket) {
    const socketId = socket.id;
    socketsStatus[socket.id] = {};
  
  
    console.log("connect");
  
    socket.on("voice", function (data) {
// when recived voice   
      var newData = data.split(";");
      newData[0] = "data:audio/ogg;";
      newData = newData[0] + newData[1];
  
      for (const id in socketsStatus) {
  
        if (id != socketId && !socketsStatus[id].mute && socketsStatus[id].online)
          socket.broadcast.to(id).emit("send", newData);
      }
  
    });
  
    socket.on("userInformation", function (data) {
      socketsStatus[socketId] = data;
  
      io.sockets.emit("usersUpdate",socketsStatus);
    });
  
  
    socket.on("disconnect", function () {
      delete socketsStatus[socketId];
    });
  
  });


http.listen(3000, () => {
  console.log("the app is run in port 3000!");
});
