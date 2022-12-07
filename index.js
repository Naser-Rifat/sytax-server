const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g0xoz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("ok");
    const database = await client.db("syntax");
    const servicesCollection = await database.collection("services");
    const userDataCollection = await database.collection("users");

    app.get("/services", async (req, res) => {
      const query = await servicesCollection.find({});
      const result = await query.toArray();
      res.json(result);
    });

    //get cycle info
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };

      const result = await servicesCollection.findOne(query);
      res.json(result);
    });

    // add cycles info
    app.post("/services", async (req, res) => {
      const cycle = req.body;
      console.log(cycle);
      const result = await servicesCollection.insertOne(cycle);
      console.log( res.json(result))
      res.json(result);
    });
    // delete an products item

    //make a api for add user bu registration form
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(req.body);
      const result = await userDataCollection.insertOne(user);
      console.log(result);
      res.json(user);
    });

    //make a api for add user of google login
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user?.email };
      const options = { upsert: true };
      const doc = { $set: user };
      const result = await userDataCollection.updateOne(filter, doc, options);
      res.json(result);
    });

    //make a api for query orders of individual user
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = await userDataCollection.findOne(filter);
      let IsAdmin = false;
      if (user?.role === "admin") {
        IsAdmin = true;
      }
      res.json({ admin: IsAdmin });
    });

    //make a api for add an admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log(user.email);
      const filter = { email: user?.email };
      const doc = { $set: { role: "admin" } };
      const result = await userDataCollection.updateOne(filter, doc);
      console.log(result);
      res.json(result);
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("server running");
});
app.listen(port, () => {
  console.log("server running at port", port);
});
