//This code was found on this youtube video
//https://www.youtube.com/watch?v=DvlyzDZDEq4&t

const socket = io('/')
const videoGrid = document.getElementById('video-grid')



//Stun and ICe is handeled by peer.js
// if a specific 
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001',

  config: {
    iceServers: [{
      urls: 'turn:18.118.143.138:3478?transport=tcp',
      credential: 'root',
      username: 'user'
    }],
  },
})

const myVideo = document.createElement('video')
myVideo.muted = true
//An empty list of the peers
const peers = {}


// navigator.mediaDevices gets the media permissions to get the video and audio
// Creates a stream object and runs the addVideoStream function
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)




// When a peer calls 
  myPeer.on('call', call => {
    console.log("Is calling")

// Responds and stream    
    call.answer(stream)
    const video = document.createElement('video')

    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })




//When a new client connects this fucntion is run
  socket.on('user-connected', userId => {
    console.log("Connected:" + userId)
    
//When this client connects to the server it reuns the 
// connectToNewUser fucnction stream 
    connectToNewUser(userId, stream)

  })
})



socket.on('user-disconnected', userId => {
  console.log("Connected:" + userId)
//Removes peer from the list of peers
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})



//When a new user connects this function runs
//This function is run automaticaly calling the other clients immediately
function connectToNewUser(userId, stream) {

  console.log("Calling")
 //myPeer calls the new user and sends the stream
  const call = myPeer.call(userId, stream)
 // Creats a new video element 
  const video = document.createElement('video')
 
 //adds users users video stream
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })

  //Closes video 
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}




//This appends the users own video stream to the html page
function addVideoStream(video, stream) {
  console.log("Vid Streamcreated")
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}