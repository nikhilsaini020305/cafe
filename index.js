const express = require('express');
require('dotenv').config();
const dotenv = require('dotenv');
dotenv.config();
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile('views/2.html', { root: __dirname });
});
app.get('/menu', (req, res) => {
    res.sendFile('views/menu.html', { root: __dirname });
});
app.get('/about', (req, res) => {
    res.sendFile('views/about.html', { root: __dirname });
});
app.get('/Order', (req, res) => {
    res.sendFile('views/Order.html', { root: __dirname });
});

app.get('/contact', (req, res) => {
    res.sendFile('views/contact.html', { root: __dirname });
});
app.get('/book', (req, res) => {
    res.sendFile('views/book.html', { root: __dirname });
});
app.get('/delet', (req, res) => {
    res.sendFile('views/delet.html', { root: __dirname });
});

const DATA_FILE = path.join(__dirname, "data3.html");

// Create file if missing
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    `
    <html>
    <head>
      <title>Submitted Orders</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background: #f2f2f2; }
      </style>
    </head>
    <body>
      <h2>All Orders</h2>
      <table>
        <thead>
          <tr>
            <th>S. No.</th>
            <th>Name</th>
            <th>Date & Time</th>
            <th>people</th>
            <th>date</th>
            <th>time</th>
            <th>Items</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody id="data-body"></tbody>
      </table>
    </body>
    </html>
    `
  );
}



// Helper: count rows
function getEntryCount() {
  const data = fs.readFileSync(DATA_FILE, "utf8");
  const matches = data.match(/<tr>/g);
  return matches ? matches.length : 0;
}

let currentEntry = {};

// Step 1: collect name and email
app.post("/submitA", (req, res) => {
  const { date,fName,people, time } = req.body;
  currentEntry = { fName,people,date, time };
  res.redirect("/book");
});

// Step 2: collect order
app.post("/order", (req, res) => {
  const { items, total } = req.body;

  let itemList = [];
  if (typeof items === "string") {
    itemList = items.split(",").map((i) => i.trim());
  } else if (Array.isArray(items)) {
    itemList = items;
  }

  const merged = {
    ...currentEntry,
    items: itemList,
    total: total || "0",
  };

  const count = getEntryCount() + 1;

  const entry = `
    <tr>
      <td>${count}</td>
      <td>${new Date().toLocaleString()}</td>
      <td>${merged.fName || ""}</td>
      <td>${merged.people || ""}</td>
      <td>${merged.date || ""}</td>
      <td>${merged.time || ""}</td>
      <td>${merged.items.join(", ")}</td>
      <td>₹${merged.total}</td>
    </tr>
  `;

  let fileData = fs.readFileSync(DATA_FILE, "utf8");
  fileData = fileData.replace("</tbody>", entry + "\n</tbody>");
  fs.writeFileSync(DATA_FILE, fileData);

  currentEntry = {};
  res.redirect("/order");

});

// Admin route (password protected)
app.get("/admin", (req, res) => {
  const password = req.query.pass;
  if (password === "owner123") {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    res.send(data);
  } else {
    res.status(403).send("🚫 Access denied. Invalid password.");
  }
});
const port=process.env.PORT || 4000;

app.listen(port,() => {
  console.log(`Server is running on port ${port}`);
});