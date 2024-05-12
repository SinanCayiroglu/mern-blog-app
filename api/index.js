const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user");
const Post = require("./models/post")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require("fs")
const path = require("path")
const {fileURLToPath} = require("url")
const app = express();

const salt = bcrypt.genSaltSync(10);
const secret = "asdsafafhr";

app.use(cors({ credentials: true, origin: "https://mern-blog-app-alpha.vercel.app" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads",express.static(__dirname+"/uploads"))
app.use(express.static(__dirname+"/client/build"))

mongoose.connect(
  "mongodb+srv://cayiroglusinan:OcOceBMkIuC6B8gl@cluster0.m3jl6ng.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"
);
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (err) {
    res.status(400).json(err);
  }});
  
  app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json({ id: userDoc._id, username });
      });
    } else {
      res.status(400).json("wrong credentials");
    }
  });

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/post",upload.single('file'),async (req,res)=>{
  let newPath;
  if(req.file){
    const {originalname,path} = req.file
  const parts = originalname.split(".")
  const ext = parts[parts.length-1]
   newPath = path+"."+ext
   fs.renameSync(path,newPath)
  }
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
  const {title,summary,content} = req.body
  const postData = {
    title,
    summary,
    content,
    author:info.id
  }
  if(newPath){
    postData.cover = newPath
  }
  const postDoc = await Post.create(postData)
  res.json(postDoc)
})
})

app.put("/post", upload.single("file"), async (req, res) => {
  let newPath;
  if (req.file) {
      const { originalname, path } = req.file;
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      newPath = path + "." + ext;
      fs.renameSync(path, newPath);
  }
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;
      const { title, summary, content } = req.body;
      
      const postDoc = await Post.findById(req.body.id);
      if (!postDoc) {
          return res.status(404).json("Post not found");
      }

      const isAuthor = postDoc.author.toString() === info.id;
      if (!isAuthor) {
          return res.status(400).json("You are not the author of this post");
      }

      const postData = {
          title,
          summary,
          content,
          author: info.id
      };
      if (newPath) {
          postData.cover = newPath;
      }
      // Assuming you want to update the post
      // You may need to adjust this based on your schema and ORM
      const updatedPostDoc = await Post.findByIdAndUpdate(req.body.id, postData, { new: true });
      res.json(updatedPostDoc);
  });
});

app.delete('/post/:id', async (req, res) => {
  const { id } = req.params;
  const { token } = req.cookies;

  try {
    // Verify user authentication
    const info = jwt.verify(token, secret);
    
    // Find the post by ID
    const postDoc = await Post.findById(id);
    if (!postDoc) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if the current user is the author of the post
    const isAuthor = postDoc.author.toString() === info.id;
    if (!isAuthor) {
      return res.status(403).json({ message: "You don't have permission to delete this post" });
    }

    // Delete the post
    await Post.findByIdAndDelete(id);

    // Return a success message
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get("/post",async (req,res)=>{
  res.json(
    await Post.find()
    .populate("author",["username"])
    .sort({createdAt:-1})
    .limit(20)
  )
})

app.get("/post/:id", async(req,res)=>{
  const {id} = req.params
  const postDoc = await Post.findById(id).populate("author",["username"])
  res.json(postDoc)
})

app.listen(4000);
