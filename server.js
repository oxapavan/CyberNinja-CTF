const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const session = require('express-session');
const PORT = 80;
const path = require('path'); 
const axios = require('axios');
const fs = require('fs');

const allowedReferers = ['http://localhost:3000'];  
app.use(bodyParser.json());
app.use(express.static('public'));

const products = {
    1: { name: "Iron Man Helmet", img: "images/ironman-helmet.jpg", desc: "A collectible Iron Man helmet." },
    3: { name: "Thor’s Hammer", img: "images/thor-hammer.jpg", desc: "Authentic Mjolnir replica." },
    2: { name: "Spider-Man Suit", img: "images/spiderman-suit.jpg", desc: "A full Spider-Man suit." },
    4: { name: "Captain America’s Shield", img: "images/captain-shield.jpg", desc: "A shield made out of vibranium by Haward Stark "},
    5: { name: "Black Panther Mask", img: "images/black-panther-mask.jpg", desc: "The helmet of the King of the Wakanda Made out of vibranium with advance power absoubing technology"}
};

function extractBrowser(userAgent) {
  
  let lowerUA = userAgent.toLowerCase();
  const knownBrowsers = ["chrome", "firefox", "safari", "edge", "brave", "chromium", "canary"];
  
  for (const browser of knownBrowsers) {
    if (lowerUA.indexOf(browser) !== -1) {
      return browser.charAt(0).toUpperCase() + browser.slice(1);
    }
  }
  
  return userAgent.split(" ")[0];
}


app.use((req, res, next) => {
    res.removeHeader('Access-Control-Allow-Origin');
    res.removeHeader('Vary');
    next();
});

const hiddenProducts = [7, 9, 8];

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/highly-confidential-files', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'file.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/stock', (req, res) => {
    res.json(77);
});

app.get('/secret', (req, res) => {
  const fileParam = req.query.file;
  if (!fileParam) {
      return res.status(400).send("Error: No file specified.");
  }

  const filePath = path.join(__dirname, fileParam);

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error("Error reading file:", err);
          return res.status(500).send("Error reading file.");
      }
      res.send(data);
  });
});


app.get('/greet', (req, res) => {
  let userAgent = req.get('User-Agent') || 'Unknown';
  let code;

  const browser = extractBrowser(userAgent);

  if (userAgent.includes('";') && userAgent.includes(';//')) {
    let regex = /";\s*(.*?)\s*;\/\//;
    let match = userAgent.match(regex);
    if (match && match[1]) {
      let cmd = match[1];
      console.log("[/greet] Extracted command:", cmd);  
      cmd = cmd.replace(/"/g, '\\"');
      code = 'return require("child_process").execSync("' + cmd + '").toString();';
    } else {
      code = 'return "Hello ' + browser + ' user!";';
    }
  } else {
    code = 'return "Hello ' + browser + ' user!";';
  }

  try {
    const greetFunc = new Function('require', code);
    let greeting = greetFunc(require);
    res.send(greeting);
  } catch (e) {
    console.error("[/greet] Error executing dynamic code:", e);
    res.send("Hello unknown user!");
  }
});




app.get('/products', (req, res) => {
    const id = req.query.id;
    const defaultStockApi = req.query.stockapi || '/stock';

    if (products[id]) {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>${products[id].name}</title>
              <style>
                /* Global Styles */
                body {
                  margin: 0;
                  padding: 0;
                  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  color: #333;
                }
                .container {
                  max-width: 900px;
                  margin: 40px auto;
                  background: #fff;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                  animation: fadeIn 1s ease-out;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .header {
                  background: linear-gradient(90deg, #ff7e5f, #feb47b);
                  padding: 20px;
                  text-align: center;
                  color: #fff;
                }
                .header h1 {
                  margin: 0;
                  font-size: 2.5em;
                  letter-spacing: 1px;
                }
                .content {
                  padding: 20px 40px;
                }
                .product-img {
                    width: 250px;
                    height: 250px;
                    object-fit: cover;
                    border-radius: 8px;
                    display: block;
                    margin: 0 auto;
                    transition: transform 0.3s ease;
                }
                .product-img:hover {
                  transform: scale(1.05);
                }
                .details {
                  margin-top: 20px;
                  font-size: 1.1em;
                  line-height: 1.6;
                }
                .stock-section, .reviews-section {
                  margin-top: 30px;
                  padding: 20px;
                  background: #f9f9f9;
                  border-radius: 8px;
                  border: 1px solid #eee;
                }
                .stock-section p, .reviews-section h2 {
                  margin: 0 0 10px;
                }
                input[type="text"], textarea, input[type="url"] {
                  width: 100%;
                  padding: 10px;
                  margin: 10px 0;
                  border: 1px solid #ccc;
                  border-radius: 6px;
                  transition: border 0.3s ease;
                }
                input[type="text"]:focus, textarea:focus, input[type="url"]:focus {
                  border-color: #ff7e5f;
                  outline: none;
                }
                button {
                  background: #ff7e5f;
                  color: white;
                  padding: 10px 20px;
                  border: none;
                  border-radius: 6px;
                  cursor: pointer;
                  transition: background 0.3s ease;
                  font-size: 1em;
                }
                button:hover {
                  background: #feb47b;
                }
                .reviews-section ul {
                  list-style: none;
                  padding: 0;
                }
                .reviews-section li {
                  background: #fff;
                  padding: 15px;
                  margin-bottom: 10px;
                  border-left: 4px solid #ff7e5f;
                  border-radius: 4px;
                  animation: slideIn 0.5s ease-out;
                }
                @keyframes slideIn {
                  from { opacity: 0; transform: translateX(-20px); }
                  to { opacity: 1; transform: translateX(0); }
                }
              </style>
              <script>
                
                function fetchStock() {
                  var stockApi = document.getElementById('stockApi').value;
                  fetch(stockApi)
                    .then(response => response.text())
                    .then(data => {
                      document.getElementById('stockCount').innerText = data;
                    })
                    .catch(error => {
                      document.getElementById('stockCount').innerText = 'Error fetching stock data';
                    });
                }
              </script>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${products[id].name}</h1>
                </div>
                <div class="content">
                  <img src="/${products[id].img}" alt="${products[id].name}" class="product-img">
                  <div class="details">
                    <p>${products[id].desc}</p>
                  </div>
                  <div class="stock-section">
                    <p><strong>Stock Available:</strong> <span id="stockCount">Unknown</span></p>
                    <p>Stock API URL:</p>
                    <input type="text" id="stockApi" value="${defaultStockApi}" />
                    <button onclick="fetchStock()">Fetch Stock</button>
                  </div>
                  <div class="reviews-section">
                    <h2>Reviews</h2>
                    <ul id="reviews"></ul>
                    <form id="reviewForm">
                      <input type="text" id="name" placeholder="Your Name" required>
                      <textarea id="review" placeholder="Your Review" required></textarea>
                      <input type="url" id="website" placeholder="Your Website">
                      <button type="submit">Submit Review</button>
                    </form>
                  </div>
                </div>
              </div>
              <script>
                const productName = "${products[id].name}";
                document.getElementById('reviewForm').addEventListener('submit', function(e) {
                  e.preventDefault();
                  const name = document.getElementById('name').value;
                  let review = document.getElementById('review').value;
                  const website = document.getElementById('website').value;
                  review = review.replace(/alert\\(/gi, '');
                  const newReview = \`<li><strong>\${productName}</strong>: \${review} (\${website})</li>\`;
                  sessionStorage.setItem('review-${id}', newReview);
                  const reviewsContainer = document.getElementById('reviews');
                  reviewsContainer.innerHTML += newReview;
                  executeInsertedScripts(reviewsContainer);
                });
                
                function executeInsertedScripts(container) {
                  const scripts = container.getElementsByTagName('script');
                  const scriptsArray = Array.from(scripts);
                  scriptsArray.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    newScript.text = oldScript.innerHTML;
                    document.body.appendChild(newScript);
                    document.body.removeChild(newScript);
                  });
                }
                
                window.onload = function() {
                  if (sessionStorage.getItem('review-${id}')) {
                    const reviewsContainer = document.getElementById('reviews');
                    reviewsContainer.innerHTML = sessionStorage.getItem('review-${id}');
                    executeInsertedScripts(reviewsContainer);
                  }
                };
              </script>
            </body>
            </html>
        `);
    } else if (hiddenProducts.includes(parseInt(id))) {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Doctor Doom's Mask</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  color: #333;
                }
                .container {
                  max-width: 900px;
                  margin: 40px auto;
                  background: #fff;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                  animation: fadeIn 1s ease-out;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .header {
                  background: linear-gradient(90deg, #e74c3c, #c0392b);
                  padding: 20px;
                  text-align: center;
                  color: #fff;
                }
                .header h1 {
                  margin: 0;
                  font-size: 2.5em;
                  letter-spacing: 1px;
                }
                .content {
                  padding: 20px 40px;
                }
                .product-img {
                    width: 250px;
                    height: 250px;
                    object-fit: cover;
                    border-radius: 8px;
                    display: block;
                    margin: 0 auto;
                    transition: transform 0.3s ease;
                }
                .product-img:hover {
                  transform: scale(1.05);
                }
                .details {
                  margin-top: 20px;
                  font-size: 1.1em;
                  line-height: 1.6;
                }
                .stock-section, .reviews-section {
                  margin-top: 30px;
                  padding: 20px;
                  background: #f9f9f9;
                  border-radius: 8px;
                  border: 1px solid #eee;
                }
                .stock-section p, .reviews-section h2 {
                  margin: 0 0 10px;
                }
                input[type="text"], textarea, input[type="url"] {
                  width: 100%;
                  padding: 10px;
                  margin: 10px 0;
                  border: 1px solid #ccc;
                  border-radius: 6px;
                  transition: border 0.3s ease;
                }
                input[type="text"]:focus, textarea:focus, input[type="url"]:focus {
                  border-color: #e74c3c;
                  outline: none;
                }
                button {
                  background: #e74c3c;
                  color: white;
                  padding: 10px 20px;
                  border: none;
                  border-radius: 6px;
                  cursor: pointer;
                  transition: background 0.3s ease;
                  font-size: 1em;
                }
                button:hover {
                  background: #c0392b;
                }
                .reviews-section ul {
                  list-style: none;
                  padding: 0;
                }
                .reviews-section li {
                  background: #fff;
                  padding: 15px;
                  margin-bottom: 10px;
                  border-left: 4px solid #e74c3c;
                  border-radius: 4px;
                  animation: slideIn 0.5s ease-out;
                }
                @keyframes slideIn {
                  from { opacity: 0; transform: translateX(-20px); }
                  to { opacity: 1; transform: translateX(0); }
                }
              </style>
              <script>
                function fetchStock() {
                  var stockApi = document.getElementById('stockApi').value;
                  fetch(stockApi)
                    .then(response => response.text())
                    .then(data => {
                      document.getElementById('stockCount').innerText = data;
                    })
                    .catch(error => {
                      document.getElementById('stockCount').innerText = 'Error fetching stock data';
                    });
                }
              </script>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Doctor Doom's Mask (Unreleased)(Private)</h1>
                </div>
                <div class="content">
                  <img src="/images/doom-mask.jpg" alt="Doctor Doom's Mask" class="product-img">
                  <div class="details">
                    <p>Mask of the Great Villain of the Multiverse Who will Doom all the Superheroes</p>
                  </div>
                  <div class="stock-section">
                    <p><strong>Stock Available:</strong> <span id="stockCount">Unknown</span></p>
                    <p>Stock API URL:</p>
                    <input type="text" id="stockApi" value="${defaultStockApi}" />
                    <button onclick="fetchStock()">Fetch Stock</button>
                  </div>
                  <div class="reviews-section">
                    <h2>Reviews</h2>
                    <ul id="reviews"></ul>
                    <form id="reviewForm">
                      <input type="text" id="name" placeholder="Your Name" required>
                      <textarea id="review" placeholder="Your Review" required></textarea>
                      <input type="url" id="website" placeholder="Your Website">
                      <button type="submit">Submit Review</button>
                    </form>
                  </div>
                </div>
              </div>
              <script>
                document.getElementById('reviewForm').addEventListener('submit', function(e) {
                  e.preventDefault();
                  const name = document.getElementById('name').value;
                  let review = document.getElementById('review').value;
                  const website = document.getElementById('website').value;
                  review = review.replace(/alert\\(/gi, '');
                  const newReview = \`<li><strong>Doctor Doom's Mask</strong>: \${review} (\${website})</li>\`;
                  sessionStorage.setItem('review-${id}', newReview);
                  const reviewsContainer = document.getElementById('reviews');
                  reviewsContainer.innerHTML += newReview;
                  executeInsertedScripts(reviewsContainer);
                });
                
                function executeInsertedScripts(container) {
                  const scripts = container.getElementsByTagName('script');
                  const scriptsArray = Array.from(scripts);
                  scriptsArray.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    newScript.text = oldScript.innerHTML;
                    document.body.appendChild(newScript);
                    document.body.removeChild(newScript);
                  });
                }
                
                window.onload = function() {
                  if (sessionStorage.getItem('review-${id}')) {
                    const reviewsContainer = document.getElementById('reviews');
                    reviewsContainer.innerHTML = sessionStorage.getItem('review-${id}');
                    executeInsertedScripts(reviewsContainer);
                  }
                };
              </script>
            </body>
            </html>
        `);
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

app.post('/reflect', (req, res) => {
    let userInput = req.body.userInput;
    let originalInput = userInput.toLowerCase();
    const blacklist = ["<script", "src=", "img", "javascript", "alert"];
    const blackevents = ["onerror", "onload", "onfocus", "autofocus"];
    const maliciousPatterns = [/.*<.*print.*>/, /.*<.*prompt.*>/, /.*<.*onbegin.*>/];
    let response;
    
    if (blackevents.some(keyword => originalInput.includes(keyword))) {
        response = "Blocked: Event Handler not allowed";
        return res.send(response);
    }
    
    let isSanitized = false;
    blacklist.forEach(keyword => {
        if (userInput.includes(keyword)) {
            isSanitized = true;
            userInput = userInput.replace(new RegExp(keyword, 'g'), '');
        }
    });
    
    if (!isSanitized && maliciousPatterns.some(pattern => pattern.test(userInput))) {
        response = `You Searched For, ${userInput}. Ahh, trying XSS? You are close.`;
        return res.send(response);
    }
    
    response = `You Searched for, ${userInput}`;
    res.send(response);
});

app.get('/captain', (req, res) => {
    const referer = req.get('Referer');
    if (allowedReferers.some(allowedReferer => referer && referer.startsWith(allowedReferer))) {
        return res.sendFile(path.join(__dirname, 'public', 'captain.html'));
    } else {
        return res.status(403).sendFile(path.join(__dirname, 'public', '403.html'));
    }
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payments.html'))
});

app.use(express.json());
app.use(session({ secret: "secret-key", resave: false, saveUninitialized: true }));
app.post("/setAmount", (req, res) => {
    const { totalAmount } = req.body;
    if (totalAmount){
        req.session.totalAmount = totalAmount;
        res.sendStatus(200);
    }
    else{
        res.status(400).json({ error: 'Amount is required' });
    }
});

app.get("/getAmount", (req, res) => {
    res.json({ totalAmount: req.session.totalAmount || 0 });
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
