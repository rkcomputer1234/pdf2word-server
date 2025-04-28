const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const ILPDF_PUBLIC_KEY = 'project_public_bb17f868aaaae59de5bf8cc9baccf2dd_owXVJe5d27daa1a3b8de887ac1c2cf102e24a';
const PORT = process.env.PORT || 3000;

app.use(cors());

app.post('/convert', upload.single('pdf'), async (req, res) => {
  try {
    // 1. Start the task
    const startRes = await axios.post('https://api.ilovepdf.com/v1/start', {
      public_key: ILPDF_PUBLIC_KEY,
      tool: 'pdf2word'
    });
    const { server, task } = startRes.data;

    // 2. Upload the file
    const formData = new FormData();
    formData.append('task', task);
    formData.append('file', fs.createReadStream(req.file.path));

    const uploadRes = await axios.post(`https://${server}/v1/upload`, formData, {
      headers: formData.getHeaders()
    });

    // Important: get server_filename from upload response
    const serverFilename = uploadRes.data.server_filename;

    // 3. Process the file
    await axios.post(`https://${server}/v1/process`, {
      task,
      tool: 'pdf2word',
      files: [
        {
          server_filename: serverFilename,
          filename: req.file.originalname
        }
      ]
    });

    // 4. Download the result
    const downloadRes = await axios({
      method: 'get',
      url: `https://${server}/v1/download/${task}`,
      responseType: 'stream'
    });

    res.setHeader('Content-Disposition', 'attachment; filename="converted.docx"');
    downloadRes.data.pipe(res);

    // 5. Clean up
    fs.unlinkSync(req.file.path);

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).send('Conversion failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
