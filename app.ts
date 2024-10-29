import express, { NextFunction, Request, Response } from 'express';
import compression from "compression"
import { createServer } from "http"
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from "cors";
import { MulterError } from 'multer';
import { connectDatabase } from './config/db';
import AppRoutes from "./routes/index";

import path from 'path';
import { Server } from "socket.io";
import { getCurrentUser, userJoin, userLeave } from "./utils/handleSocketUsers";
import { Storage } from '@google-cloud/storage';
import morgan from 'morgan';
import { activateMaintenanceWork } from './utils/activateMaintenanceWork';

const app = express()
const server = createServer(app)


//env setup
dotenv.config();
const PORT = Number(process.env.PORT) || 5000
const HOST = process.env.HOST || "http://localhost"
const ENV = process.env.NODE_ENV || "development"

app.use(express.json({ limit: '30mb' }))
app.use(cookieParser());
app.use(compression())

//logger
app.use(morgan('common'))


//mongodb database
connectDatabase();

let origin = ""
if (ENV === "development") {
    origin = "http://localhost:3000"
    let origin2 = "http://localhost:8081"
    app.use(cors({
        origin: [origin, origin2],
        credentials: true
    }))
}

if (ENV === "production") {
    origin = "https://agarson-client.netlify.app"
    let origin2 = "https://agarson-client.onrender.com"
    app.use(cors({
        origin: [origin, origin2],
        credentials: true
    }))
}


let io: Server | undefined = undefined
io = new Server(server, {
    cors: {
        origin: origin,
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("socket connected")
    socket.on('JoinRoom', async (id: string) => {
        console.log("running in room", id)
        const user = userJoin(id)
        socket.join(user.id)

        socket.on("disconnect", (reason) => {
            let user = getCurrentUser(id)
            if (user)
                userLeave(user.id)
            console.log(`socket ${socket.id} disconnected due to ${reason}`);
        });
    })

});



//cloud storage setupu config

const storage = new Storage({
    projectId: process.env.projectId,
    credentials: {
        type: process.env.type,
        private_key: process.env.private_key,
        client_email: process.env.client_email,
        client_id: process.env.client_id,
        universe_domain: process.env.universe_domain
    }
})

export const bucketName = String(process.env.bucketName)
export const bucket = storage.bucket(bucketName)



//server routes
app.use("/api/v1", AppRoutes)
activateMaintenanceWork();


//react app handler
if (ENV === "production") {
    app.use(express.static(path.join(__dirname, "build")))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, "build/", "index.html"));
    })
}
else {
    app.use("*", (_req: Request, res: Response, _next: NextFunction) => {
        res.status(404).json({ message: "resource not found" })
    })
}
//error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    if (err instanceof MulterError)
        return res.status(400).json({ message: "please select required no of files and field names" })
    res.status(500).json({
        message: err.message || "unknown  error occured"
    })
})

//server setup
if (!PORT) {
    console.log("Server Port not specified in the environment")
    process.exit(1)
}
server.listen(PORT, () => {
    console.log(`running on ${HOST}:${PORT}`)
});

export {
    io
}
