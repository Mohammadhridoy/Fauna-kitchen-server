const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000; 
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zfjzbub.mongodb.net/?retryWrites=true&w=majority `;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const foodCollection = client.db('kitchen').collection('addfooditem');


    app.post("/addfood", async(req, res) =>{
      const foodlist = req.body; 

      console.log(foodlist)
      const result = await foodCollection.insertOne(foodlist)
      res.send(result)
    })
    

    app.get("/addfood", async(rq, res) =>{
      const foodlist = foodCollection.find()
        const result= await foodlist.toArray()
        res.send(result)
    })










    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Fauna kitchen website is running.....')
})

app.listen(port, () => {
  console.log(`Fauna kitchen listening on port ${port}`)
})