const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000; 
require('dotenv').config()

// middleware
app.use(cors({
  origin:['http://localhost:5173'], 
  credentials: true
}))
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
    const purchaseCollection = client.db('kitchen').collection('purchaseinfo');


    app.post("/addfood", async(req, res) =>{
      const foodlist = req.body; 

      const result = await foodCollection.insertOne(foodlist)
      res.send(result)
    })
    

    app.get("/addfood", async(req, res) =>{
      const foodlist = foodCollection.find()
        const result= await foodlist.toArray()
        res.send(result)
    })

    app.get("/addfood/:id", async(req, res ) =>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}

      const result = await foodCollection.findOne(query)
      res.send(result)

    })

    // post purchase date 
    app.post('/purchase', async(req, res) =>{
      const purchaseinfo = req.body; 
      const result = await purchaseCollection.insertOne(purchaseinfo)
      res.send(result)

    })

    // get addfood date using email 
    app.get('/addfood', async(req,res) =>{
      console.log(req.query.email)
      let query = { };
      if(req.query?.email) {
        query = {  useremail: req.query.email}

      }
      const result = await foodCollection.find(query).toArray();
      res.send(result)

    })
    // update food items info 
    app.put('/addfood/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true }
      const updatedFoodItem = req.body; 
      const updateInfo = {
        $set:{
          foodname:updatedFoodItem.foodname, 
          category:updatedFoodItem.category, 
          quantity:updatedFoodItem.quantity,
          image:updatedFoodItem.image, 
          price:updatedFoodItem.price, 
          description: updatedFoodItem.description, 
          country:updatedFoodItem.country
        },
      };
      const result = await foodCollection.updateOne(filter, updateInfo, options)
      res.send(result)
    })

    


    // pagination 
  //   app.get('/foods', async(req, res) => {
  //     const page = parseInt(req.query.page)
  //     const size = parseInt(req.query.size)
  //     const result = await foodCollection.find()
      
  //     .skip(page * size)
  //     .limit(size)
  //     .toArray();
  //     res.send(result);
  // })

  // app.get('/foodItemsCount', async(req, res) =>{
  //   const count = await foodCollection.estimatedDocumentCount()
  //   res.send({count})
  // })










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