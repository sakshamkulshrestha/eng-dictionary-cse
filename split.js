import fs from 'fs';

// 1. Read your massive data.json file
const rawData = fs.readFileSync('./public/data.json', 'utf8');
const data = JSON.parse(rawData);

// 2. Map the domain names to your requested PDF file names
const fileMap = {
  "Algorithms": "dsa.json",
  "Operating Systems": "os.json",
  "Computer Networks": "networks.json",
  "Database Management Systems": "dbms.json",
  "Computer Architecture": "coa.json",
  "Artificial Intelligence": "ai.json",
  "Software Engineering": "se.json",
  "Cybersecurity": "cyber.json",
  "Cloud Computing": "cloud.json",
  "Theory of Computation": "toc.json"
};

const groupedData = {};

// 3. Sort each item into its correct array
data.forEach(item => {
  const fileName = fileMap[item.domain];
  if (fileName) {
    if (!groupedData[fileName]) groupedData[fileName] = [];
    groupedData[fileName].push(item);
  }
});

// 4. Create the new /data folder inside /public if it doesn't exist
const targetDir = './public/data';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

// 5. Create the 10 separate JSON files
for (const [fileName, items] of Object.entries(groupedData)) {
  fs.writeFileSync(`${targetDir}/${fileName}`, JSON.stringify(items, null, 2));
  console.log(`✅ Created ${fileName} with ${items.length} items.`);
}