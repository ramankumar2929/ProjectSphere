import dotenv from "dotenv"
import { app } from "./app.js"
import connectDB from "./db/index.js"

dotenv.config({
    path :'./env'
})

connectDB()
.then(()=>{
     app.on("error",(error)=>{
        console.log("ERROR: ",error);
        throw error
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is running at port: ${process.env.PORT} `)
        console.log(process.env.CORS_ORIGIN)
    })
})
.catch((err)=>{
     console.log("MONGODB CONNECTION FAILURE !!!", err)

})