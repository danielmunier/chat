import express, { Application } from "express"
import http from 'http'
import { Server } from "socket.io"

class App {
    private app: Application
    private httpServer: http.Server
    private io: Server


    constructor() {
        this.app = express()
        this.httpServer = http.createServer(this.app)

        this.io = new Server(this.httpServer)

        this.listenServer()
        this.listenSocket()
        this.setupRoutes()
    }


    listenServer() {
        this.httpServer.listen(3000, () => {
            console.log(`Server is running\nhttps://localhost:3000`)
        })
    }

    listenSocket() {
        this.io.on("connection", (socket) => {
            console.log(`Usuario conectado: ${socket.id}`)

            socket.on("message", (msg) => {
                console.log(msg)
                this.io.emit("message", (msg))

            })
        })
    }

    setupRoutes() {
        this.app.get("/", (req, res) => {
            res.sendFile(__dirname + "/index.html")
        })
    }

}

const app = new App()


