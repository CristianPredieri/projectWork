import {Context} from "../type"

export default function (context: Context) {
    
    
    const app = context.app

    app.get("/", async (request : any, reply : any) => {  
        reply.redirect( "../index.html")
    })
    app.post("/", async (request: any, reply: any) => {
        reply.redirect("../index.html")
    })
}