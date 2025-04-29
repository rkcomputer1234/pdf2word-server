const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('file'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = inputPath + '.docx';

  exec(`libreoffice --headless --convert-to docx --outdir uploads ${inputPath}`, (err) => {
    if (err) {
      console.error('Conversion error:', err);
      return res.status(500).send('Conversion failed');
    }

    res.download(outputPath, 'converted.docx', (err) => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
