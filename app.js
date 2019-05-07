const path = require('path')
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

app.use(express.static(path.join(__dirname, '../fe/build')))

async function main() {
  const pixelData = await Jimp.read('./pixelData.png')
  let onlineCount = 0

  let dotOperations = [] 

  setInterval(() => {
    if(dotOperations.length) {
      io.emit('update-dots', dotOperations)
      dotOperations.length = 0
    }
  }, 100)

  io.on('connection', async (socket) => {
    onlineCount++

    io.emit('online-count', onlineCount)

    var pngBuffer = await pixelData.getBufferAsync(Jimp.MIME_PNG)
    var lastDrawTime = 0
    socket.emit('initial-pixel-data', pngBuffer)
  
    socket.on('draw-dot', async ({row, col, color}) => {
      var now = Date.now()
      if(now - lastDrawTime < 500) {
        return
      }
      lastDrawTime = now
      var hexColor = Jimp.cssColorToHex(color)
  
      pixelData.setPixelColor(hexColor, col, row)
      // pixelData[row][col] = color

      dotOperations.push({row, col, color})
  
      // io.emit('update-dot', {row, col, color})
      // socket.broadcast.emit('update-dot', {row, col, color})
      // socket.emit('update-dot', {row, col, color})

      try {
        var buf = await pixelData.getBufferAsync(Jimp.MIME_PNG)
        await fs.promises.writeFile('./pixelData.png', buf)
        console.log('save pixel data success!')
      } catch(e) {
        console.log(e)
      }
    })

    socket.on('chat-msg', msg => {
      io.emit('chat-msg', msg)
    })
  
    socket.on('disconnect', () => {
      onlineCount--
      console.log('someone leaves')
    })
  })
}

main()