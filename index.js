require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

const customerRoutes = require('./routes/customer.routes');
const itemRoutes = require('./routes/item.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const bulkRoutes = require('./routes/bulk.routes');


// routes
app.use('/customer', customerRoutes);
app.use('/item', itemRoutes);
app.use('/invoice', invoiceRoutes);
app.use('/bulk', bulkRoutes);

app.get('/', (req, res) => {
    res.send('api running...');
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'route not found'
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});