const mongoose=require('mongoose')
const { MongoClient, ServerApiVersion } = require('mongodb');

const client = new MongoClient(process.env.DATABASE_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const DBconnect=async ()=>{
    try {
        await mongoose.connect(process.env.DATABASE_URI)
        await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } catch (error) {
        console.log(error)
    }

}

module.exports=DBconnect