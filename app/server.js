const http = require("http");
const url = require("url");

const PORT = process.env.PORT || 3000;

const products = [
  { id: 1, name: "Wireless Headphones", price: 1499, emoji: "HEADPHONE" },
  { id: 2, name: "Smart Watch", price: 2499, emoji: "WATCH" },
  { id: 3, name: "Bluetooth Speaker", price: 999, emoji: "SPEAKER" },
  { id: 4, name: "Laptop Backpack", price: 799, emoji: "BAG" },
  { id: 5, name: "Gaming Mouse", price: 599, emoji: "MOUSE" },
  { id: 6, name: "USB-C Charger", price: 699, emoji: "CHARGER" }
];

function page(title, body) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { margin:0; font-family: Arial, sans-serif; background:#f4f6f8; }
    header { background:#111827; color:white; padding:20px; text-align:center; }
    .container { max-width:1000px; margin:30px auto; padding:20px; }
    .card { background:white; padding:25px; border-radius:14px; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
    input, button { width:100%; padding:12px; margin:10px 0; border-radius:8px; border:1px solid #ccc; font-size:16px; }
    button { background:#2563eb; color:white; border:none; cursor:pointer; }
    button:hover { background:#1d4ed8; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:20px; }
    .product { background:white; padding:20px; border-radius:14px; box-shadow:0 4px 10px rgba(0,0,0,0.08); text-align:center; }
    .emoji { font-size:20px; font-weight:bold; margin-bottom:10px; }
    a { text-decoration:none; }
  </style>
</head>
<body>
  <header><h1>MiniShop E-Commerce</h1></header>
  <div class="container">${body}</div>
</body>
</html>`;
}

function loginPage() {
  return page("Login", `
    <div class="card" style="max-width:400px;margin:auto;">
      <h2>Login</h2>
      <form action="/products" method="GET">
        <input type="text" placeholder="Username" required>
        <input type="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
    </div>
  `);
}

function productsPage() {
  const productCards = products.map(p => `
    <div class="product">
      <div class="emoji">${p.emoji}</div>
      <h3>${p.name}</h3>
      <p>Rs. ${p.price}</p>
      <a href="/payment?product=${encodeURIComponent(p.name)}&price=${p.price}">
        <button>Buy Now</button>
      </a>
    </div>
  `).join("");

  return page("Products", `
    <h2>Products</h2>
    <div class="grid">${productCards}</div>
  `);
}

function paymentPage(query) {
  const product = query.product || "Selected Product";
  const price = query.price || "0";

  return page("Payment", `
    <div class="card" style="max-width:500px;margin:auto;">
      <h2>Payment Page</h2>
      <p><b>Product:</b> ${product}</p>
      <p><b>Total Amount:</b> Rs. ${price}</p>
      <form action="/success" method="GET">
        <input type="text" placeholder="Cardholder Name" required>
        <input type="text" placeholder="Card Number" required>
        <input type="text" placeholder="Expiry Date" required>
        <input type="text" placeholder="CVV" required>
        <button type="submit">Pay Now</button>
      </form>
    </div>
  `);
}

function successPage() {
  return page("Success", `
    <div class="card" style="max-width:500px;margin:auto;text-align:center;">
      <h2>Payment Successful</h2>
      <p>Thank you for shopping with MiniShop.</p>
      <a href="/products"><button>Back to Products</button></a>
    </div>
  `);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let html;

  if (parsedUrl.pathname === "/" || parsedUrl.pathname === "/login") {
    html = loginPage();
  } else if (parsedUrl.pathname === "/products") {
    html = productsPage();
  } else if (parsedUrl.pathname === "/payment") {
    html = paymentPage(parsedUrl.query);
  } else if (parsedUrl.pathname === "/success") {
    html = successPage();
  } else if (parsedUrl.pathname === "/api/message") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      message: "MiniShop ecommerce app is running",
      status: "success"
    }));
    return;
  } else {
    html = page("404", "<h2>404 Page Not Found</h2>");
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`MiniShop running on port ${PORT}`);
});