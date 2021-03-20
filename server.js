const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
const db = require('./server/db/database');
const cors = require('cors')
const deduplicate = require('./server/service/cartSvc')

app.use(express.static(path.join(__dirname, 'build')));

app.use(cors());

app.get('/health', function (req, res) {
  return res.send('ok');
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// Get product info API
app.get('/product', function (req, res) {
  db.all("SELECT * FROM product", (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.status(200).json({ "data": rows });
  });
})

/*
Partner would like you to integrate the membership listing page with server data through API
 (Note that only listing feature is required. Add-to-cart or purchase feature of membership are not needed).
  The API should support filtering by grade. (Suggested time: 30 Minutes)
*/


// Get membership info
 app.get('/membership', function (req, res) {
   let sql = `SELECT * FROM membership`;
   db.all(sql, (err, rows) => {
     if (err) {
       res.status(400).json({ "error": err.message });
       return;
     }
     res.status(200).json({ "data": rows });
   })

 })

/*
SELECT t1.id,
       t1.name
  FROM TABLE_1 t1
 WHERE t1.id NOT IN (SELECT id
                       FROM TABLE_2)
                       */
// Add product to cart API with query params productId
app.post('/cart', function (req, res) {

  if (typeof req.query.productId === "undefined") {
    res.status(400).json({ "error": "Missing query param - productId" });
    return;
  }

  db.run(`INSERT INTO cart_item (product_id) VALUES (${req.query.productId} SELECT product_id FROM cart_item WHERE NOT EXISTS (SELECT product_id FROM cart_item))`, (err) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    db.all(`SELECT p.id,p.name,p.price FROM cart_item ct INNER JOIN product p on ct.product_id = p.id`, (err, rows) => {
      res.status(201).json({ "data": rows });
    })

  })
})


// Get cart's product
app.get('/cart', function (req, res) {
  db.all(`SELECT p.id,p.name,p.price FROM cart_item ct INNER JOIN product p on ct.product_id = p.id`, (err, rows) => {

    const result = deduplicate(rows);

    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.status(200).json({ "data": result });
  })
})

//Delet cart's prodcut 
app.delete('/cart', function (req, res) {
  db.run(`DELETE FROM cart_item`, (err) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
  })

  db.all(`SELECT p.id,p.name,p.price FROM cart_item ct INNER JOIN product p on ct.product_id = p.id`, (err, rows) => {
    res.status(201).json({ "data": rows });
  })

})


app.listen(port, () => {
  console.log(`Start listening on port ${port}...`)
});

module.exports = { app };



