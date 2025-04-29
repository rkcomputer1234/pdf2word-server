const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');  // We will use fetch to call iLovePDF API

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 3000;

app.use(cors());

const ILOVE_PDF_API_KEY = 'project_public_bb17f868aaaae59de5bf8cc9baccf2dd_owXVJe5d27daa1a3b8de887ac1c2cf102e24a'; // Your API Key

app.get('/', (req, res) => {
  res.send('PDF to Word API is running with iLovePDF');
});

app.post('/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(__dirname, req.file.path);

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await fetch('https://api.ilovepdf.com/v1/pdf2word', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ILOVE_PDF_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Conversion failed.');
    }

    const result = await response.json();
    const downloadUrl = result.download_url; // This will be the URL of the converted Word file

    // Now, we can download the converted file and send it to the user
    const wordFileResponse = await fetch(downloadUrl);
    const wordFileBuffer = await wordFileResponse.buffer();
    const outputPath = path.join(__dirname, 'downloads', `${req.file.filename}.docx`);

    fs.writeFileSync(outputPath, wordFileBuffer);

    res.download(outputPath, 'converted.docx', () => {
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
