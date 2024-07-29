const express = require("express");
const session = require("express-session");
const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const passport = require("passport");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
require("./config/passport");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs"); // New
app.set("views", path.join(__dirname, "views")); // New

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

app.get("/dashboard", async (req, res) => {
  if (req.isAuthenticated()) {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { files: true },
    });
    res.render("dashboard", { folders });
  } else {
    res.redirect("/login");
  }
});

app.post("/folders", async (req, res) => {
  if (req.isAuthenticated()) {
    await prisma.folder.create({
      data: {
        name: req.body.name,
        userId: req.user.id,
      },
    });
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

app.post("/folders/delete", async (req, res) => {
  if (req.isAuthenticated()) {
    const folderId = parseInt(req.body.folderId);

    // Find all files in the folder
    const files = await prisma.file.findMany({
      where: { folderId },
    });
    await prisma.file.deleteMany({
      where: { folderId },
    });
    await prisma.folder.delete({
      where: {
        id: folderId,
      },
    });
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

//  **************  uploading route

app.post("/upload", upload.single("file"), async (req, res) => {
  if (req.isAuthenticated()) {
    const { originalname, filename, size, mimetype } = req.file;
    await prisma.file.create({
      data: {
        name: originalname,
        path: path.join(__dirname, "uploads", filename),
        size,
        type: mimetype,
        folderId: parseInt(req.body.folderId),
      },
    });
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

app.get("/files/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    const file = await prisma.file.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.render("fileDetails", { file });
  } else {
    res.redirect("/login");
  }
});

app.get("/files/download/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    // const filePath = path.join(__dirname, "uploads", file.path);
    res.download(file.path, file.name);
  } else {
    res.redirect("/login");
  }
});

// **************
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
