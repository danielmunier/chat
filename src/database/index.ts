import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

export class MongoDb {
    private uri: string;
    private client: MongoClient | null = null;

    constructor() {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("A URI do MongoDB não está definida nas variáveis de ambiente.");
        }
        this.uri = uri;
    }

    async run(): Promise<MongoClient> {
        if (!this.client) {
            this.client = new MongoClient(this.uri, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                },
            });

            try {
                await this.client.connect();
            } catch (error) {
                console.error("Erro ao conectar ao MongoDB:", error);
                throw error;
            }
        }

        return this.client;
    }

    getClient(): MongoClient {
        if (!this.client) {
            throw new Error("MongoDB client não inicializado. Chame o método 'run()' primeiro.");
        }
        return this.client;
    }

    async registerUser(username: string, password: string): Promise<void> {
        const client = this.getClient();
        const db = client.db("chat_ws");
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            throw new Error("Usuário já registrado.");
        }

        await usersCollection.insertOne({ username, password });
    }

    async loginUser(username: string, password: string): Promise<void> {
        const client = this.getClient();
        const db = client.db("chat_ws");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ username });
        if (!user || user.password !== password) {
            throw new Error("Credenciais inválidas.");
        }
    }
}

export const database = new MongoDb();
