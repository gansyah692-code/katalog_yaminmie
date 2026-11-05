const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

app.use(cors());
app.use(express.json());

app.get(`/`, (req,res) => {
    res.send("hello dari serves!");
});

app.get('/api/produk', (req,res) =>{
    const produk = [
        {
            id : 1,
            nama : "Ekspresso",
            harga : 115000
        }
    ];
    res.json(produk);
}); 

app.listen(port,() => {
    console.log(`berhasil berjalan ci http//localhost:${port}`)
    
}
);