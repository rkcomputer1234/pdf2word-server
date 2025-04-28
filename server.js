const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });

const ILPDF_PUBLIC_KEY = 'YOUR_PUBLIC_API_KEY'; // <-- यहाँ अपनी iLovePDF API KEY डालना

app.post('/convert', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post('https://api.ilovepdf.com/v1/pdf/convert/word', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${ILPDF_PUBLIC_KEY}`
      },
      responseType: 'stream'
    });

    res.setHeader('Content-Disposition', 'attachment; filename=converted.docx');
    response.data.pipe(res);
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Conversion failed.');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
