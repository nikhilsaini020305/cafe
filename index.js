const express = require("express");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==================== PAGES ====================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views/2.html"));
});

app.get("/menu", (req, res) => {
    res.sendFile(path.join(__dirname, "views/menu.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views/about.html"));
});

app.get("/Order", (req, res) => {
    res.sendFile(path.join(__dirname, "views/Order.html"));
});

app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "views/contact.html"));
});

app.get("/book", (req, res) => {
    res.sendFile(path.join(__dirname, "views/book.html"));
});

// ==================== DATA FILE ====================

const DATA_FILE = path.join(__dirname, "data4.html");

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Submitted Orders</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h2 { text-align: center; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
        th { background: #f2f2f2; }
    </style>
</head>
<body>
    <h2>All Orders</h2>
    <table>
        <thead>
            <tr>
                <th>S. No.</th>
                <th>Submitted At</th>
                <th>Name</th>
                <th>People</th>
                <th>Date</th>
                <th>Time</th>
                <th>Items</th>
                <th>Quantity</th>
                <th>Total Price</th>
            </tr>
        </thead>
        <tbody id="data-body"></tbody>
    </table>
</body>
</html>`);
}

// ==================== HELPERS ====================

function getEntryCount() {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    const matches = data.match(/<tr>/g);
    return matches ? matches.length : 0;
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

let currentEntry = {};

// ==================== STEP 1: BOOKING ====================

app.post("/submitA", (req, res) => {
    const { date, fName, people, time } = req.body;

    if (!fName || !date || !time || !people) {
        return res.status(400).send(
            "Please complete all booking details."
        );
    }

    currentEntry = { fName, people, date, time };

    res.redirect("/book");
});

// ==================== STEP 2: ORDER + QUANTITY ====================

app.post("/order", (req, res) => {
    try {
        const { items, total } = req.body;

        let itemList = [];

        if (typeof items === "string") {
            itemList = [items.trim()];
        } else if (Array.isArray(items)) {
            itemList = items.map(item => String(item).trim());
        }

        // Get each selected item's quantity from the form
        const quantities = {};

        for (const [key, value] of Object.entries(req.body)) {
            if (key.startsWith("quantity_")) {
                const quantity = Number(value);

                if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
                    return res.status(400).send("Invalid item quantity.");
                }

                quantities[key] = quantity;
            }
        }

        // Match item names to their quantity field names
        const quantityNames = {
            "CAFFE LATTE": "quantity_CAFFE_LATTE",
            "ICED CARAMEL LATTE": "quantity_ICED_CARAMEL_LATTE",
            "CAFFE MOCHA": "quantity_CAFFE_MOCHA",
            "ESPRESSO MACCHIATO": "quantity_ESPRESSO_MACCHIATO",
            "White Chocolate Mocha": "quantity_WHITE_CHOCOLATE_MOCHA",
            "Caramel Macchiato": "quantity_CARAMEL_MACCHIATO",
            "Caffe Americano": "quantity_CAFFE_AMERICANO",
            "Iced Smoked Latte": "quantity_ICED_SMOKED_LATTE",
            "Cappuccino": "quantity_CAPPUCCINO",
            "Iced Caffe Mocha": "quantity_ICED_CAFFE_MOCHA",
            "Vanilla Latte": "quantity_VANILLA_LATTE",
            "Iced Gingerbread Latte": "quantity_ICED_GINGERBREAD_LATTE"
        };

        const selectedItems = itemList.map(item => ({
            name: item,
            quantity: quantities[quantityNames[item]] || 1
        }));

        if (selectedItems.length === 0) {
            return res.status(400).send("Please select at least one item.");
        }

        const merged = {
            ...currentEntry,
            items: selectedItems,
            total: total || "0"
        };

        const count = getEntryCount() + 1;

        const itemsHtml = merged.items
            .map(item => `${escapeHtml(item.name)} (Qty: ${item.quantity})`)
            .join(", ");

        const totalQuantity = merged.items.reduce(
            (sum, item) => sum + item.quantity, 0
        );

        const entry = `
            <tr>
                <td>${count}</td>
                <td>${escapeHtml(new Date().toLocaleString())}</td>
                <td>${escapeHtml(merged.fName)}</td>
                <td>${escapeHtml(merged.people)}</td>
                <td>${escapeHtml(merged.date)}</td>
                <td>${escapeHtml(merged.time)}</td>
                <td>${itemsHtml}</td>
                <td>${totalQuantity}</td>
                <td>₹${escapeHtml(merged.total)}</td>
            </tr>
        `;

        let fileData = fs.readFileSync(DATA_FILE, "utf8");

        fileData = fileData.replace(
            "</tbody>",
            `${entry}\n</tbody>`
        );

        fs.writeFileSync(DATA_FILE, fileData, "utf8");

        console.log("\n========== NEW ORDER ==========");
        console.log("Name:", merged.fName);
        console.log("People:", merged.people);
        console.log("Date:", merged.date);
        console.log("Time:", merged.time);
        console.log("Items and quantities:", merged.items);
        console.log("Total quantity:", totalQuantity);
        console.log("Total price:", merged.total);
        console.log("Saved to data4.html");
        console.log("===============================\n");

        currentEntry = {};

        res.redirect("/Order");
    } catch (error) {
        console.error("Order saving error:", error);
        res.status(500).send("Unable to save the order.");
    }
});

// ==================== ADMIN PAGE ====================

app.get("/admin", (req, res) => {
    const password = req.query.pass;

    if (password && password === process.env.ADMIN_PASSWORD) {
        return res.sendFile(DATA_FILE);
    }

    res.status(403).send("Access denied. Invalid password.");
});

// ==================== START SERVER ====================

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});