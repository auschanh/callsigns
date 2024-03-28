const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "./words.csv");

const csvJSON = () => {
  let data = fs.readFileSync(csvPath, { encoding: "utf-8" }, (err) => {
    console.log(err);
  });

  data = data.split("\n");

  let result = [];

  data.forEach((word) => {
    let temp = {};

    let row = word.split(",");

    temp["word"] = row[0];

    result.push(temp);
  });

  const jsonPath = path.join(__dirname, "./newWords.json");

  return JSON.stringify(result);

  // fs.writeFileSync(jsonPath, JSON.stringify(result), 'utf8', (err) => {console.log(err)});
};

module.exports = { csvJSON };
