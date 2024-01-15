// index.js
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3001; // Set your desired port

app.use(bodyParser.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//console.log('MySQL connection pool created successfully');

// Export the pool for use in other files
module.exports = pool;

// Include routes after exporting the pool
app.use(require('./loginRoutes'));
app.use(require('./customerRoutes'));
app.use(require('./heatTreatmentGroupRoutes'));
app.use(require('./itemRoutes'));
app.use(require('./transactionRoutes'));
app.use(require('./expensesRoutes'));
app.use(require('./operationRoutes.js'));
app.use(require('./dashboardRoutes.js'));
app.use(require('./invoiceRoutes.js'));

// Start the server
app.listen(port, () => {
    //console.log(`Server is running on port ${port}`);
});
