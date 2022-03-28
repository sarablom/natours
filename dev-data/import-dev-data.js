const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../models/tourModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);

mongoose.connect(DB).then(() => {
  console.log("Successfully connected to database");
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/data/tours-simple.json`, "utf-8"));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("data succefully loaded");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("data succefully deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData()
} else if (process.argv[2] === "--delete") {
  deleteData();
}

console.log(process.argv);
