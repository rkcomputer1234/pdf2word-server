
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

app.post("/convert", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      "https://api.ilovepdf.com/v1/convert/pdf_to_word",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: "Bearer project_public_bb17f868aaaae59de5bf8cc9baccf2dd_owXVJe5d27daa1a3b8de887ac1c2cf102e24a"
        },
        responseType: "stream"
      }
    );

    res.setHeader("Content-Disposition", "attachment; filename=converted.docx");
    response.data.pipe(res);
  } catch (error) {
    console.error("Conversion error:", error.response?.data || error.message);
    res.status(500).send("Conversion failed");
  } finally {
    fs.unlink(filePath, () => {});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
