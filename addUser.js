const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function addUser(username, password) {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    console.log(`User ${username} added successfully.`);
  } catch (error) {
    console.error("Error adding user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage
const username = "ashutosh2";
const password = "pass123";

addUser(username, password);
