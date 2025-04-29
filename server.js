const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.send('PDF to Word API is running');
});

app.post('/convert', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const inputPath = req.file.path;
  const outputPath = path.join('uploads', path.parse(req.file.originalname).name + '.docx');

  exec(`libreoffice --headless --convert-to docx --outdir uploads ${inputPath}`, (err, stdout, stderr) => {
    if (err) {
      console.error('Conversion error:', err);
      return res.status(500).send('Conversion failed.');
    }

    res.download(outputPath, 'converted.docx', (downloadErr) => {
      // Cleanup: Uploaded file और generated file को delete करना
      try {
        fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
      if (downloadErr) {
        console.error('Download error:', downloadErr);
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
