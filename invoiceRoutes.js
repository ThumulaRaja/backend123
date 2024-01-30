const express = require('express');
const router = express.Router();
const cors = require('cors');
const util = require('util');
const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf'); // Install this library: npm install html-pdf
const QRCode = require('qrcode'); // Install this library: npm install qrcode



const pool = require('./index');
router.use(cors());
pool.query = util.promisify(pool.query);

router.post('/generateInvoice', async (req, res) => {
    try {
        const { data } = req.body;
        const { CODE, TYPE, C_NAME,ITEM_CODE, DATE, METHOD, AMOUNT_SETTLED,AMOUNT,PAYMENT_AMOUNT,DUE_AMOUNT,PHONE_NUMBER } = data;

            const templatePath = path.join(__dirname, 'invoice-template.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        const renderedHtml = htmlTemplate.replace('{{code}}', CODE).replace('{{type}}', TYPE).replace('{{c_name}}', C_NAME).replace('{{item_code}}', ITEM_CODE).replace('{{date}}', DATE.split('T')[0]).replace('{{method}}', METHOD).replace('{{amount_settled}}', AMOUNT_SETTLED).replace('{{amount}}', AMOUNT).replace('{{payment_amount}}', PAYMENT_AMOUNT).replace('{{due_amount}}', DUE_AMOUNT).replace('{{phone_number}}', PHONE_NUMBER);

        pdf.create(renderedHtml).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error generating PDF:', err);
                res.json({ success: false, message: err.message });
            } else {
                console.log('PDF generated successfully!');
                res.json({ success: true, data: buffer.toString('base64') });
            }
        });
    } catch (error) {
        console.error('Error generating PDF:', error.message);
        res.json({ success: false, message: error.message });
    }
});

router.post('/generateQR', async (req, res) => {
    try {
        const { data } = req.body;
        const { CODE, TYPE } = data;

        let qrLink = '';

        // Generate QR code
        if (TYPE === 'Rough') {
            qrLink = `http://localhost:3000/rough/${CODE}`;
        } else if (TYPE === 'Sorted Lots') {
            qrLink = `http://localhost:3000/sorted-lots/${CODE}`;
        } else if (TYPE === 'Lots') {
            qrLink = `http://localhost:3000/lots/${CODE}`;
        } else if (TYPE === 'Cut and Polished') {
            qrLink = `http://localhost:3000/c-p/${CODE}`;
        }

        const qrCodeDataUrl = await QRCode.toDataURL(qrLink);

        const templatePath = path.join(__dirname, 'qr.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        const renderedHtml = htmlTemplate.replace('{{code}}', CODE).replace('{{qrLink}}', qrCodeDataUrl);

        // Set the page size to 40mm width and 40mm height
        const pdfOptions = { width: '40mm', height: '40mm' }; // Assuming standard A4 size (297mm height)

        pdf.create(renderedHtml, pdfOptions).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error generating PDF:', err);
                res.json({ success: false, message: err.message });
            } else {
                console.log('PDF generated successfully!');
                res.json({ success: true, data: buffer.toString('base64') });
            }
        });
    } catch (error) {
        console.error('Error generating PDF:', error.message);
        res.json({ success: false, message: error.message });
    }
});


module.exports = router;
