const express = require('express');
const router = express.Router();
const cors = require('cors');

const pool = require('./index'); // Assuming you have a proper MySQL connection pool module

router.use(cors());

const util = require('util');

// Promisify the pool.query method
pool.query = util.promisify(pool.query);

// Now you can use pool.query with async/await
router.post('/getItemCountData', async (req, res) => {
    //console.log('Get item count data request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch counts for Rough items
        const roughCountsQuery = await pool.query(
            'SELECT COUNT(*) AS COUNT, ROUGH_TYPE FROM items WHERE IS_ACTIVE=1 AND TYPE = "Rough" AND IS_IN_INVENTORY = 1 GROUP BY ROUGH_TYPE'
        );

        // Query to fetch counts for Lots items
        const lotsCountsQuery = await pool.query(
            'SELECT COUNT(*) AS COUNT, LOT_TYPE FROM items WHERE IS_ACTIVE=1 AND TYPE = "Lots" AND IS_IN_INVENTORY = 1 GROUP BY LOT_TYPE'
        );

        // Query to fetch counts for Sorted Lots items
        const sortedLotsCountsQuery = await pool.query(
            'SELECT COUNT(*) AS COUNT, SORTED_LOT_TYPE FROM items WHERE IS_ACTIVE=1 AND TYPE = "Sorted Lots" AND IS_IN_INVENTORY = 1 GROUP BY SORTED_LOT_TYPE'
        );

        // Query to fetch counts for Cut and Polished items
        const cutAndPolishedCountsQuery = await pool.query(
            'SELECT COUNT(*) AS COUNT, CP_TYPE FROM items WHERE IS_ACTIVE=1 AND TYPE = "Cut and Polished" AND IS_IN_INVENTORY = 1 GROUP BY CP_TYPE'
        );

        // Prepare the response data
        const result = {
            roughCounts: roughCountsQuery,
            lotsCounts: lotsCountsQuery,
            sortedLotsCounts: sortedLotsCountsQuery,
            cutAndPolishedCounts: cutAndPolishedCountsQuery,
        };
        //console.log('result:', result);

        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getSoldItemCountData', async (req, res) => {
    //console.log('Get sold item count data request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Query to fetch counts for Rough items
        const roughCountsQuery = await pool.query(
            'SELECT COUNT(*) AS COUNT FROM items WHERE IS_ACTIVE=1 AND TYPE = "Rough" AND STATUS = "Sold"'
        );

        // Query to fetch counts for Lots items
        const lotsCountsQuery = await pool.query(
            'SELECT COUNT(*) AS COUNT FROM items WHERE IS_ACTIVE=1 AND TYPE = "Lots" AND STATUS = "Sold"'
        );

        // Query to fetch counts for Sorted Lots items
        const sortedLotsCountsQuery = await pool.query(
            'SELECT COUNT(*) AS COUNT FROM items WHERE IS_ACTIVE=1 AND TYPE = "Sorted Lots" AND STATUS = "Sold"'
        );

        // Query to fetch counts for Cut and Polished items
        const cutAndPolishedCountsQuery = await pool.query(
            'SELECT COUNT(*) AS COUNT FROM items WHERE IS_ACTIVE=1 AND TYPE = "Cut and Polished" AND STATUS = "Sold"'
        );

        // Prepare the response data
        const result = [
            roughCountsQuery[0].COUNT,
            lotsCountsQuery[0].COUNT,
            sortedLotsCountsQuery[0].COUNT,
            cutAndPolishedCountsQuery[0].COUNT,
        ];
        //console.log('result:', result);
        //console.log('result:', result);

        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/getTransactionData', async (req, res) => {
    //console.log('Get transaction data request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        // Calculate the date for the beginning of the previous year
        const previousYearStartDate = new Date();
        previousYearStartDate.setFullYear(previousYearStartDate.getFullYear() - 1);
        previousYearStartDate.setMonth(0); // January
        previousYearStartDate.setDate(1); // 1st day

        // Format the date for MySQL format (YYYY-MM-DD)
        const formattedStartDate = previousYearStartDate.toISOString().split('T')[0];

        // Query to fetch buy transactions sum of amounts grouped by filtering months from DATE within the previous year
        const buyTransactionsQuery = await pool.query(`
            SELECT SUM(PAYMENT_AMOUNT) AS AMOUNT, MONTH(DATE) AS MONTH
            FROM transactions
            WHERE IS_ACTIVE=1 AND (TYPE = "Buying" OR TYPE = "B Payment")
            AND DATE >= '${formattedStartDate}'
            GROUP BY MONTH(DATE)
        `);
        //console.log('buyTransactionsQuery:', buyTransactionsQuery);

        // Query to fetch sell transactions sum of amounts grouped by filtering months from DATE within the previous year
        const sellTransactionsQuery = await pool.query(`
            SELECT SUM(PAYMENT_AMOUNT) AS AMOUNT, MONTH(DATE) AS MONTH
            FROM transactions
            WHERE IS_ACTIVE=1 AND (TYPE = "Selling" OR TYPE = "S Payment")
            AND DATE >= '${formattedStartDate}'
            GROUP BY MONTH(DATE)
        `);
        //console.log('sellTransactionsQuery:', sellTransactionsQuery);

        // Prepare the response data
        const result = {
            buyTransactions: arrangeTransactionsArray(buyTransactionsQuery),
            sellTransactions: arrangeTransactionsArray(sellTransactionsQuery),
        };
        //console.log('result:', result);

        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Function to arrange transactions array as per requirements
function arrangeTransactionsArray(transactionsQueryResult) {
    const arrangedArray = new Array(12).fill(0); // Initialize an array with 12 zeros

    transactionsQueryResult.forEach((transaction) => {
        // Use the MONTH value (1 to 12) as the index in the array
        const index = transaction.MONTH - 1;
        arrangedArray[index] = transaction.AMOUNT;
    });

    return arrangedArray;
}


router.post('/getCashDashboardData', async (req, res) => {
    //console.log('Get cash dashboard data request received:');
    try {
        // Ensure the MySQL connection pool is defined
        if (!pool) {
            console.error('Error: MySQL connection pool is not defined');
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }


        const buyCashOutTransactionsQuery = await pool.query(`
            SELECT SUM(PAYMENT_AMOUNT) AS AMOUNT
            FROM transactions
            WHERE IS_ACTIVE=1 AND (TYPE = "Buying" OR TYPE = "B Payment") AND METHOD = "Cash"
        `);

        const sellCashInTransactionsQuery = await pool.query(`
            SELECT SUM(PAYMENT_AMOUNT) AS AMOUNT
            FROM transactions
            WHERE IS_ACTIVE=1 AND (TYPE = "Selling" OR TYPE = "S Payment") AND METHOD = "Cash"
        `);

        const buyBankOutTransactionsQuery = await pool.query(`
            SELECT SUM(PAYMENT_AMOUNT) AS AMOUNT
            FROM transactions
            WHERE IS_ACTIVE=1 AND (TYPE = "Buying" OR TYPE = "B Payment") AND METHOD = "Bank"
        `);

        const sellBankInTransactionsQuery = await pool.query(`
            SELECT SUM(PAYMENT_AMOUNT) AS AMOUNT
            FROM transactions
            WHERE IS_ACTIVE=1 AND (TYPE = "Selling" OR TYPE = "S Payment") AND METHOD = "Bank"
        `);

        const totalExpensesQuery = await pool.query(`
            SELECT SUM(AMOUNT) AS AMOUNT
            FROM expenses
            WHERE IS_ACTIVE=1
        `);

        // Prepare the response data
        const result = {
            buyCashOutTransactions: buyCashOutTransactionsQuery[0].AMOUNT ? buyCashOutTransactionsQuery[0].AMOUNT : 0,
            sellCashInTransactions: sellCashInTransactionsQuery[0].AMOUNT ? sellCashInTransactionsQuery[0].AMOUNT : 0,
            cashBalance: sellCashInTransactionsQuery[0].AMOUNT - buyCashOutTransactionsQuery[0].AMOUNT,
            buyBankOutTransactions: buyBankOutTransactionsQuery[0].AMOUNT ? buyBankOutTransactionsQuery[0].AMOUNT : 0,
            sellBankInTransactions: sellBankInTransactionsQuery[0].AMOUNT ? sellBankInTransactionsQuery[0].AMOUNT : 0,
            bankBalance: sellBankInTransactionsQuery[0].AMOUNT - buyBankOutTransactionsQuery[0].AMOUNT,
            totalExpenses: totalExpensesQuery[0].AMOUNT ? totalExpensesQuery[0].AMOUNT : 0,
        };
        //console.log('result:', result);

        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = router;
