//This code was found on this youtube video
//https://www.youtube.com/watch?v=DvlyzDZDEq4&t
/*
//How To Create A Video Chat App With WebRTC - Web Dev Simplified
https://www.youtube.com/watch?v=DvlyzDZDEq4&t
Attempted fix and update - https://github.com/js12lh/DIGM5520_voice_chat/tree/main/1%20Peerjs

This tutorial is one of the most popular youtube tutorials on creating video chat applications. 
This tutorial was my first introduction to web and browser-based communications. In the tutorial, 
the video chat application worked flawlessly each user can join a room through a browser, as they 
join their video feed is added into the frame. Though in implementation there were plenty of issues.
The application uses a socket.io server to exchange peer.js information. Peer.js is a wrapper for 
WebRTC that simplifies the information exchange process. The information exchange allows for the 
users to connect to each other’s browsers directly, an additional server is no longer necessary 
after the connection is established. The benefit of this example is that the can add as many 
individual clients as you need with performance loss. I was not able to test that capability
due to several issues with the library, this was documented in the issue section of peerjs GitHub. 
It appears that the last line in the library was incorrect and did not link to assisting pages properly.

//# sourceMappingURL=/peerjs.min.js.map
Several issues reported 
https://github.com/peers/peerjs/issues/711
https://github.com/peers/peerjs/issues/721
answer found at https://github.com/peers/peerjs/issues/721

Unfortunately, regardless of this fix, peerjs still does not work. The browser console does not error.
Though there are moments when it connects after refreshing hundreds of times. I attempted to debug
the application using socket.io the information exchange occurs but it appears that the peerjs
library is the issue. Initially, I thought it was the configuration of peerjs STUN/ TURN servers 
as there were multiple issues posted on GitHub of other STUN/TURN servers that were not working.
https://gist.github.com/yetithefoot/7592580
//
*/

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

//This Generates a unique uuid 
//When user goes to the webiste
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})


app.get('/:room', (req, res) => {
// res.render renders the html room.ejs template 
  res.render('room', { roomId: req.params.room })
})

//When a user connects to this server
io.on('connection', socket => {

// When the user send the join-room functions 
// Along with the roomId and its user id 
  socket.on('join-room', (roomId, userId) => {

//This joins the room with the unique id
    socket.join(roomId)
    console.log(roomId)
//Broadcast userid to everyone in the room    
    socket.broadcast.to(roomId).emit('user-connected', userId)
//Broadcast userid of the people that exited
    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})

server.listen(3000)
