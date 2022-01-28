const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uxoa3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const blogCollection = client.db("adventure_travel").collection("totalBlog");
    const ordersCollection = client.db("adventure_travel").collection("blogPost");
    const reviewsCollection = client.db("adventure_travel").collection("reviews");
    const usersCollection = client.db("adventure_travel").collection("users");

    // get api 
    app.get('/totalBlogss', async(req,res) =>{
        const cursor = blogCollection.find({})
        const page = req.query.page;
        const size = parseInt(req.query.size);
        const count = await cursor.count();
        let totalBlogss;
        if(page){
             totalBlogss = await cursor.skip(page*size).limit(size).toArray();
        }else{
            totalBlogss = await cursor.toArray();
        }
        res.send({
          count,
          totalBlogss
        });
    });
    app.get('/myorders', async(req,res) =>{
    const orders = await ordersCollection.find({}).toArray();
    res.send(orders);
    });
    app.get('/reviews', async(req,res) =>{
    const reviews = await reviewsCollection.find({}).toArray();
    res.send(reviews);
    });

    // insert user order data
    app.post("/totalBlogss",(req,res)=>{
      blogCollection.insertOne(req.body).then((result)=>{
           res.send(result);
      })
    }) 
    app.post("/myorders",(req,res)=>{
      ordersCollection.insertOne(req.body).then((result)=>{
           res.send(result);
      })
    }) 
    // insert user review data
    app.post("/reviews",(req,res)=>{
      reviewsCollection.insertOne(req.body).then((result)=>{
           res.send(result);
      })
    }) 

    //   // delete my orders 
  app.delete('/myorders/:id', async(req,res) =>{
    const id = req.params.id;
    const query = {_id:id};
    const result = await ordersCollection.deleteOne(query);
    res.send(result);
  })


  app.get('/users/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user?.role === 'admin') {
        isAdmin = true;
    }
    res.json({ admin: isAdmin });
  })

  app.post('/users', async(req,res) =>{
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.send(result);
})

app.put('/users', async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const options = { upsert: true };
  const updateDoc = { $set: user };
  const result = await usersCollection.updateOne(filter, updateDoc, options);
  res.json(result);
});

app.put('/users/admin', async (req, res) => {
const user = req.body;
const filter = { email: user.email };
const updateDoc = { $set: { role: 'admin' } };
const result = await usersCollection.updateOne(filter, updateDoc);
res.json(result);

})

app.put('/confirmation/:id', async (req, res) => {
  const id = req.params.id;
  const query = {_id:id};
  // const filter = { email: user.email };
  const product = {
      $set: {
        status : "Confirm"
      }
  }
  const result = await ordersCollection.updateOne(query, product);
  console.log(result)
  res.json(result);
  
  })

    // delete my orders 
    app.delete('/myorders/:id', async(req,res) =>{
      const id = req.params.id;
      const query = {_id:id};
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    })
  
    // delete reviews
    app.delete('/reviews/:id', async(req,res) =>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    })
  
    // delete products
    app.delete('/products/:id', async(req,res) =>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    })
  
  
    // client.close();
  });

app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)

})