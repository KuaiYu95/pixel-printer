// const path = require('path')
const express = require('express')
const SocketIO = require('socket.io')
const Jimp = require('jimp')
const fs = require('fs')

const app = express() 
const port = 3005
const server = app.listen(port, () => {
  console.log('server listening on port', port)
})

const io = SocketIO(server)

// app.use(express.static(path.join(__dirname, './dist')))

const pixelData = new Jimp(20, 20, 0xffff00ff)

io.on('connection', async (socket) => {
  var pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG)
  socket.emit('initial-pixel-data', pngBuffer)

  socket.on('draw-dot', async ({row, col, color}) => {
    var hexColor = Jimp.cssColorToHex(color)

    pixelData.setPixelColor(hexColor, col, row)
    // pixelData[row][col] = color

    socket.broadcast.emit('update-dot', {row, col, color})
    socket.emit('update-dot', {row, col, color})

    var buf = await pixelData.getBufferAsync(Jimp.MIME_PNG)
    fs.writeFile('./pixelData.png', buf, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('save pixel data success!')
      }
    })
  })

  socket.on('disconnect', () => {
    console.log('someone leaves')
  })
})