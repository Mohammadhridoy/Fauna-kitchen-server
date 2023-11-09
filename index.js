const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000; 
require('dotenv').config()

// middleware
app.use(cors({
  origin:['http://localhost:5173'], 
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zfjzbub.mongodb.net/?retryWrites=true&w=majority `;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// create middleware
const logger = async( req, res, next) =>{
  console.log('called:', req.host, req.originalUrl)
  next(); 
}

const verifyToken = async( req, res, next) =>{
  const token = req.cookies?.token;
  if(!token){
    return res.status(401).send({message:'not authorized'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, decoded) =>{
    if(err){
      return res.status(401).send({message: 'unauthorized'})
    }
    console.log('value in the token', decoded)
    req.user = decoded;
    next()
  } )

}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const foodCollection = client.db('kitchen').collection('addfooditem');
    const purchaseCollection = client.db('kitchen').collection('purchaseinfo');

    const topOrderCollection = client.db('kitchen').collection('toporder')


        //auth related api
        app.post('/jwt', logger, async(req, res) =>{
          const user = req.body
          console.log(user)
          const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
    
          res
          .cookie('token', token,{
            httpOnly: true,
            secure:false,
            sameSite:'none'
          })
          .send({success: true})
        } )


    app.post("/addfood", async(req, res) =>{
      const foodlist = req.body; 

      const result = await foodCollection.insertOne(foodlist)
      res.send(result)
    })
    

    app.get("/addfood", async(req, res) =>{
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      const result = await foodCollection.find()
          .skip(page * size)
          .limit(size)
          .toArray();
      // const foodlist = foodCollection.find()
      //   const result= await foodlist.toArray()
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
      const {foodname, count } = purchaseinfo
      await foodCollection.updateOne( 
        {foodname},
        {$inc: {count: 1}}
    )
      const result = await purchaseCollection.insertOne(purchaseinfo)
      res.send(result)

    })

    app.get('/purchases', async(req, res)=>{
      
      let query = {}
      if(req.query?.email){
         query = {userEmail: req.query.email}
      }
      

      const result = await purchaseCollection.find(query).toArray( )
      res.send(result)

    })
    // delete purchase items
    app.delete('/purchase/:id', async(req, res) =>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await purchaseCollection.deleteOne(query)
      res.send(result); 
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

    // get top ordered food api
    app.get('/addfoods', async(req, res)=>{
      const topFoodItems = await foodCollection.find({}).sort({count:-1}).limit(6).toArray()
      res.send(topFoodItems)
    })



    



  app.get('/foodItemsCount', async(req, res) =>{
    const count = await foodCollection.estimatedDocumentCount()
    res.send({count})
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