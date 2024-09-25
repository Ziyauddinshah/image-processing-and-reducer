const express = require("express");
const app = express();
const fs = require("fs");
var { parse } = require("csv-parse");
const axios = require("axios");
const path = require("path");

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, "temp-uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.get("/", (req, res) => {
  var csvData = [];
  const path = "./data.csv";
  fs.createReadStream(path)
    .pipe(parse({ delimiter: ",", from_line: 1 }))
    .on("data", function (row) {
      // executed for each row of data
      const imgs = row[2].split(",");
      const imgName = row[1];

      imgs.forEach((img) => {
        if (img !== "Input Name Urls") {
          console.log(imgName, img);
          const outputFilePath = "/temp-uploads";
          fetchImage(img, outputFilePath, imgName);
        }
      });
    })
    .on("error", function (error) {
      console.log(error.message);
    })
    .on("end", function () {
      // executed when parsing is complete
      console.log("File read successful");
    });
  res.status(200).json({ message: "Success" });
});

const fetchImage = async (url, outputFolder, imgName) => {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    const timestamp = Date.now();
    const outputFileName = `${imgName}-${timestamp}.jpg`;
    const outputPath = path.join(uploadsDir, outputFileName);
    // Save the image to the specified path
    fs.writeFileSync(outputPath, response.data);
    console.log(`Image saved to ${outputPath}`);
  } catch (error) {
    console.error("Error fetching the image:", error);
  }
};
const PORT = 5000;
app.listen(PORT, () => {
  console.log("server is running on " + PORT);
});
