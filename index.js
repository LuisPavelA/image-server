const Database = require("@replit/database")
const multer = require("multer");
const fs = require('fs')

const express = require('express');
const app = express();

const db = new Database()

const stream = require('stream')


app.set("view engine", "ejs");

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png"|| file.mimetype === "video/mp4") {
    cb(null, true)
  }else{
    cb(null, false)
  }
}


let upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

app.get('/', (req, res) => {
  let file_names = fs.readdirSync("public/images")
  var file_sizes = []
  file_names.forEach((file, index) => {
    file_sizes[index] = formatBytes(fs.statSync(`./public/images/${file_names[index]}`).size)
  }) 
  
  res.render("main", {
    directory: "/",
    names: file_names,
    sizes: file_sizes
  })
})

app.get('/stats',(req, res) => {
  res.render("stats")
})

app.get('/:directory',(req, res) => {
  const r = fs.createReadStream(`./public/images/${req.params.directory}`)
  const ps = new stream.PassThrough()
  stream.pipeline(
   r,
   ps,
   (err) => {
    if (err) {
      console.log(err)
      return res.sendStatus(400); 
    }
  })
  ps.pipe(res)
})


app.post('/image_upload_123', upload.single("file"), async (req, res) => {
  if (req.file){
    const pathName = req.file.path
    res.status(200)
    res.send(`The image is now <a href="https://images.luispavel.me/${req.file.filename}">here</a>`)

    
  }
});

app.listen(3000, () => {
  console.log('Image Server is up and running!');
});
