const { createServer } = require("http");
const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");          
const connectDB = require("./src/db/db");  
const initSocket = require("./src/sokets/socket"); 


connectDB();


const httpServer = createServer(app);


const io = initSocket(httpServer);

// Start server

httpServer.listen(3000, () => {
  console.log( "Server running on port 3000" );
});
