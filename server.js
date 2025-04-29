const express = require('express');
const multer = require('multer');
const path = require('path');
const { convert } = require('pdf2docx');  // एक लाइब्रेरी जिसका इस्तेमाल आप PDF को Word में बदलने के लिए कर सकते हैं

const app = express();
const port = 3000;

// Middleware for file uploading
const upload = multer({ dest: 'uploads/' });

// Endpoint to convert PDF to Word
app.post('/convert', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const pdfFilePath = req.file.path;

  // PDF to DOCX Conversion Logic
  convert(pdfFilePath, (err, result) => {
    if (err) {
      return res.status(500).send('Error in conversion');
    }

    // Send converted file to client
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="converted.docx"');
    res.send(result);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
