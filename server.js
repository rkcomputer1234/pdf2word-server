const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ilovepdf = require('@ilovepdf/ilovepdf-nodejs'); // install this

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 3000;

app.use(cors());

// iLovePDF API setup
const ILovePdf = ilovepdf.default;
const instance = new ILovePdf('project_public_bb17f868aaaae59de5bf8cc9baccf2dd_owXVJe5d27daa1a3b8de887ac1c2cf102e24a', 'en');

app.get('/', (req, res) => {
  res.send('PDF to Word API is running with iLovePDF');
});

app.post('/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const task = instance.newTask('pdf2word');
    await task.start();
    await task.addFile(req.file.path);
    await task.process();
    const filePath = path.join(__dirname, 'downloads', `${req.file.filename}.docx`);
    await task.download(filePath);

    res.download(filePath, 'converted.docx', () => {
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.error('Conversion error:', err);
    res.status(500).send('Conversion failed.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
