//This code was found on this youtube video
//https://www.youtube.com/watch?v=DvlyzDZDEq4&t

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