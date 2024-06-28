const express = require("express")
const cors = require("cors");

const routes = require("./routes/navigation.routes")

require('dotenv').config(".env")
const app = express();
const port = process.env.PORT

app.use(cors())
app.use(express.json())
app.use("/api", routes)

app.listen(port, () => {
   console.log(`Server started listening at http://localhost:${port}`)
})