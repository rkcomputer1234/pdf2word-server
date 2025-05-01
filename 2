const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');  // node-fetch for making API calls

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 3000;

app.use(cors());

const ILOVE_PDF_API_KEY = 'project_public_bb17f868aaaae59de5bf8cc9baccf2dd_owXVJe5d27daa1a3b8de887ac1c2cf102e24a'; // Your iLovePDF API key

app.get('/', (req, res) => {
  res.send('PDF to Word API is running with iLovePDF');
});

app.post('/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(__dirname, req.file.path);

  try {
    // Form data for iLovePDF API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    // Send POST request to iLovePDF API
    const response = await fetch('https://api.ilovepdf.com/v1/pdf2word', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ILOVE_PDF_API_KEY}`,
      },
      body: formData,
    });

    // Check if API call was successful
    if (!response.ok) {
      throw new Error('Conversion failed.');
    }

    const result = await response.json();
    const downloadUrl = result.download_url;  // The URL to download the converted Word file

    // Download the converted Word file
    const wordFileResponse = await fetch(downloadUrl);
    const wordFileBuffer = await wordFileResponse.buffer();
    const outputPath = path.join(__dirname, 'downloads', `${req.file.filename}.docx`);

    // Save the converted Word file locally
    fs.writeFileSync(outputPath, wordFileBuffer);

    // Send the converted Word file to the user
    res.download(outputPath, 'converted.docx', () => {
      // Clean up uploaded and converted files
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });

  } catch (err) {
    console.error('Conversion error:', err);
    res.status(500).send('Conversion failed.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
