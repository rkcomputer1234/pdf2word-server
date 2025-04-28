const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 3000;

app.post('/convert', upload.single('pdf'), async (req, res) => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path));
    form.append('task', 'pdf_to_word');

    const response = await axios.post('https://api.ilovepdf.com/v1/start', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer YOUR_API_KEY_HERE'   // project_public_bb17f868aaaae59de5bf8cc9baccf2dd_owXVJe5d27daa1a3b8de887ac1c2cf102e24a
      }
    });

    fs.unlinkSync(req.file.path); // temp file delete
    res.json({ message: 'File converted successfully!', data: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Conversion failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
