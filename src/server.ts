import express, { Application, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";



class App {
    private app: Application;
    private httpServer: http.Server;
    private io: Server;
    private messageFilePath: string;

    constructor() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = new Server(this.httpServer);
        this.messageFilePath = path.join(__dirname, "messages.txt");

        this.setupMiddleware();
        this.setupRoutes();
        this.listenSocket();
        this.startServer();
    }

    private setupMiddleware() {
        this.app.use(express.static(path.join(__dirname, "public")));
        this.app.use(express.json());

    }

    private startServer() {
        this.httpServer.listen(3000, async () => {
            console.log("Servidor rodando em http://localhost:3000");

           
        });
    }

    private saveMessage(msg: string) {
        fs.appendFile(this.messageFilePath, msg + "\n", (err) => {
            if (err) {
                console.error("Erro ao salvar mensagem:", err);
            }
        });
    }

    private loadMessageHistory(): string[] {
        if (fs.existsSync(this.messageFilePath)) {
            const data = fs.readFileSync(this.messageFilePath, "utf8");
            return data.split("\n").filter((line) => line.trim() !== "");
        }
        return [];
    }

    private listenSocket() {
        this.io.on("connection", (socket) => {
          
            console.log(socket.data.username)
            console.log(`Usuário conectado: ${socket.id}`);

            // Enviar histórico de mensagens ao conectar
            const messageHistory = this.loadMessageHistory();
            socket.emit("messageHistory", messageHistory);

            // Verificar se o nome de usuário está na sessão
            const username = socket.handshake.query.username || "Anônimo";
            socket.data.username = username;

            socket.on("setUsername", (username) => {
                socket.data.username = username
            });

            socket.on("message", (msg) => {
                const formattedMessage = `${socket.data.username}: ${msg}`;
                console.log(formattedMessage);

                this.saveMessage(formattedMessage);
                this.io.emit("message", formattedMessage);
            });
        });
    }

    private setupRoutes() {
        this.app.get("/", (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, "public", "chat.html"));
        });

        this.app.get("/login", (req: any, res: Response) => {
            res.sendFile(path.join(__dirname, "public", "auth.html"));
        });

      

       
    }
}

new App();
