// This Code is from https://github.com/borjanebbal/webrtc-node-app
/*https://github.com/borjanebbal/webrtc-node-app
How to Implement a Video Conference with WebRTC and Node - Borja Nebba

Updated https://github.com/js12lh/DIGM5520_voice_chat/tree/main/3%20Webrtc

This is an implementation of pure WebRTC. The only issue with this code was the syntax of
the socket.io functions were deprecated. The default google STUN servers provided in the 
code worked well, this working code allowed me to test the TURN server I created on 
Amazon ec2. Unfortunately, my server did not work, I would like to troubleshoot this at a
later time. Since the Google STUN servers work my TURN server maybe be unnecessary. 
Scaling WebRTC requires some work, as it is only intended for peer-to-peer/ two clients,
exchanging video streams with several clients increases computation cost.
*/

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use('/', express.static('public'))

io.on('connection', (socket) => {
  socket.on('join', (roomId) => {

    // Old Socket IO 
    // const roomClients = io.sockets.adapter.rooms[roomId] || { length: 0 }
    // const numberOfClients = roomClients.length
 
    // Updated socket io syntax
    // Check the number of people in the room 
    // or update 
    let numberOfClients = 0;
    if (io.sockets.adapter.rooms.has(roomId)) numberOfClients = io.sockets.adapter.rooms.get(roomId).size

    // These events are emitted only to the sender socket.
    if (numberOfClients == 0) {
      console.log(`Creating room ${roomId} and emitting room_created socket event`)
      //create a room with the room ID
      socket.join(roomId)
      socket.emit('room_created', roomId)
    } else if (numberOfClients == 1) {
    // if there are some one in the room 
    // emit your id to the person in the room 
      console.log(`Joining room ${roomId} and emitting room_joined socket event`)
      socket.join(roomId)
      socket.emit('room_joined', roomId)
    } else {
    // This limits the amount of people in the room 
    // potentially for optimization reasons
      console.log(`Can't join room ${roomId}, emitting full_room socket event`)
      socket.emit('full_room', roomId)
    }
  })

  // These events are emitted to all the sockets connected to the same room except the sender.
  // when a user enters a room it emits a call
  socket.on('start_call', (roomId) => {
    console.log(`Broadcasting start_call event to peers in room ${roomId}`)
    socket.to(roomId).emit('start_call')
  })

  // 
  socket.on('webrtc_offer', (event) => {
    console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`)
    socket.to(event.roomId).emit('webrtc_offer', event.sdp)
  })
  socket.on('webrtc_answer', (event) => {
    console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`)
    socket.to(event.roomId).emit('webrtc_answer', event.sdp)
  })
  socket.on('webrtc_ice_candidate', (event) => {
    console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`)
    socket.to(event.roomId).emit('webrtc_ice_candidate', event)
  })
})

// START THE SERVER =================================================================
const port = process.env.PORT || 3000
server.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})
