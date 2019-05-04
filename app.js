// const path = require('path')
const express = require('express')
const SocketIO = require('socket.io')

const app = express() 
const port = 3005
const server = app.listen(port, () => {
  console.log('server listening on port', port)
})

const io = SocketIO(server)

// app.use(express.static(path.join(__dirname, './dist')))

const pixelData = [
  ['red', 'black', 'blue', 'green'],
  ['red', 'black', 'blue', 'green'],
  ['red', 'black', 'blue', 'green'],
  ['red', 'black', 'blue', 'green']
]

var clients = []

io.on('connection', (socket) => {
  clients.push(socket)

  socket.emit('initial-pixel-data', pixelData)

  socket.on('draw-dot', ({row, col, color}) => {
    pixelData[row][col] = color
    socket.broadcast.emit('update-dot', {row, col, color})
    socket.emit('update-dot', {row, col, color})
  })

  socket.on('disconnect', () => {
    clients = clients.filter(it => it != socket)
    console.log('someone leaves')
  })
})