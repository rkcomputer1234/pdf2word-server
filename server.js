const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 3000;
const ILPDF_API_KEY = 'project_public_bb17f868aaaae59de5bf8cc9baccf2dd_owXVJe5d27daa1a3b8de887ac1c2cf102e24a';

app.use(cors());

app.post('/convert', upload.single('pdf'), async (req, res) => {
  try {
    // 1. Start Task
    const startResponse = await axios.post('https://api.ilovepdf.com/v1/start', {
      public_key: ILPDF_API_KEY,
      tool: 'pdf2word'
    });

    const server = startResponse.data.server;
    const taskId = startResponse.data.task;

    // 2. Upload File
    const uploadForm = new FormData();
    uploadForm.append('task', taskId);
    uploadForm.append('file', fs.createReadStream(req.file.path));

    await axios.post(`https://${server}/v1/upload`, uploadForm, {
      headers: uploadForm.getHeaders()
    });

    // 3. Process Task (very important!)
    await axios.post(`https://${server}/v1/process`, {
      task: taskId,
      tool: 'pdf2word'
    });

    // 4. Download Final File
    const downloadResponse = await axios({
      method: 'get',
      url: `https://${server}/v1/download/${taskId}`,
      responseType: 'stream'
    });

    res.setHeader('Content-Disposition', 'attachment; filename=converted.docx');
    downloadResponse.data.pipe(res);

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send('Conversion failed!');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
