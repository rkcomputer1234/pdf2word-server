const express = require('express');
const fetch = require('node-fetch');
const FormData = require('form-data');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Multer setup for file upload
const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('file'), async (req, res) => {
  const apiKey = 'project_public_bb17f868aaaae59de5bf8cc9baccf2dd_owXVJe5d27daa1a3b8de887ac1c2cf102e24a';

  try {
    // Step 1: Start a task
    const taskRes = await fetch('https://api.ilovepdf.com/v1/start/pdf/to/word', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const taskData = await taskRes.json();
    const task = taskData.task;

    // Step 2: Upload the file
    const fileStream = fs.createReadStream(req.file.path);
    const uploadForm = new FormData();
    uploadForm.append('task', task);
    uploadForm.append('file', fileStream);

    await fetch('https://api.ilovepdf.com/v1/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: uploadForm
    });

    // Step 3: Process the task
    const processRes = await fetch('https://api.ilovepdf.com/v1/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ task })
    });
    await processRes.json();

    // Step 4: Download the result
    const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${task}`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const buffer = await downloadRes.buffer();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.setHeader('Content-Disposition', 'attachment; filename=converted.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).send('Failed to convert PDF to Word.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
