// const mongoose = require("mongoose");
// const User = require("./models/user");
// const Assignment = require("./models/assignment");
// const Submission = require("./models/submission");
// const Section = require("./models/section");

// async function clearDB() {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("Connected to DB");

//     await User.deleteMany({});
//     await Assignment.deleteMany({});
//     await Submission.deleteMany({});
//     await Section.deleteMany({});

//     console.log("All collections cleared!");
//     process.exit(0);
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// }

// clearDB();

// const mongoose = require("mongoose");
// const Section = require("./models/section");
// require("dotenv").config();

// (async () => {
//   await mongoose.connect(process.env.MONGO_URL);

//   await Section.deleteMany({});
//   await Section.insertMany([
//     { name: "A" },
//     { name: "B" },
//     { name: "C" }
//   ]);

//   console.log("Sections added!");
//   process.exit();
// })();
