import express from 'express'

import {Server as SocketIOServer} from 'socket.io'
import { engine } from 'express-handlebars'
import {FileManager} from './FileManager.js'


const mensajesManager = new FileManager('./localStorage/mensajes.json')

const app = express()
app.engine('handlebars', engine())
app.set('views', './views')
app.set('view engine', 'handlebars')

app.use(express.static('./public'))

const httpServer = app.listen(8080, ()=> console.log("server activo")) // express hace un servidor, como si fuera http.createServer()

const io = new SocketIOServer(httpServer) // se le envia un servidor para que se comunique por ahi..
// socket io sirve para transformar un medio de comunicacion (httpserver), en un websocket, osea vuelve al server en bidireccional..

io.on('connection', async clientSocket=>{ 
    // io.on => equivalente al add event listener
    // este evento lo lanza io cuando se hace un handshake
    // console.log("nuevo cliente conectado", clientSocket.id)
    // clientSocket.emit('algoEnFormatoSerializable', {hola: 'mundo'})
    // clientSocket.emit('alertaaa', "hola que obnda")

    // clientSocket.on("mensajeCliente", datosAdjuntos=>{
    //     console.log("recibi un msj del clienteo")
    //     console.log(clientSocket.id)
    //     console.log("datos enviados =>", datosAdjuntos)
    // })

    clientSocket.on('nuevoMensaje', async mensaje =>{
        await mensajesManager.guardarCosa(mensaje)
        const mensajes = await mensajesManager.buscarCosas()

        const msjParaFront = mensajes.map(m => ({...m, fecha: new Date(m.fecha).toLocaleTimeString()}))
        io.sockets.emit('actualizarMensajes', msjParaFront)
        })

    const mensajes = await mensajesManager.buscarCosas()
    const msjParaFront = mensajes.map(m => ({...m, fecha: new Date(m.fecha).toLocaleTimeString()}))
    
    io.sockets.emit('actualizarMensajes', msjParaFront)
    clientSocket.on('nuevoUsuario', async nombreUsuario => {
        // metodo broadcast, que envia notificacion atodos , menos al que lo envia..
        clientSocket.broadcast.emit('nuevoUsuario', nombreUsuario)
    })
})

app.get('/', async (req,res)=>{
    const mensajes = await mensajesManager.buscarCosas()
    res.render('mensajes', {
       // hayMensajes : mensajes.length >0,
       // mensajes : mensajes
       pageTitle: 'Chat'
    })
})


