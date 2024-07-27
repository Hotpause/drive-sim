const express = require("express");
const session = require("express-session");
const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const passport = require("passport");
const multer = require("multer");

const prisma = new PrismaClient();
require("./config/passport");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
    secret: "liya",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.session());

// **************   Multer setup for file uploading
const upload = multer({ dest: "uploads/" });

// **************  authentication routee
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/upload",
    failureRedirect: "/login",
  })
);

app.get("/login", (req, res) => {
  res.send(
    '<form action="/login" method="post"><input name="username" placeholder = "username"/><input name="password" type="password" placeholder = "password"/><button type="submit">Login</button></form>'
  );
});

//  **************  uploading route
app.post("/upload", upload.single("file"), (req, res) => {
  if (req.isAuthenticated()) {
    res.send("File uploaded successfully");
  } else {
    res.redirect("/login");
  }
});

app.get("/upload", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(
      '<form action="/upload" method="post" enctype="multipart/form-data"><input type="file" name="file"/><button type="submit">Upload</button></form>'
    );
  } else {
    res.redirect("/login");
  }
});

// **************
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
