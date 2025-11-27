import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing the file' });
    }

    const file = files.file[0];
    const uploadPath = path.join(process.cwd(), 'uploads', file.originalFilename);

    try {
      await fs.promises.rename(file.filepath, uploadPath);
      return res.status(200).json({ message: 'File uploaded successfully', path: uploadPath });
    } catch (error) {
      return res.status(500).json({ error: 'Error saving the file' });
    }
  });
};

export default uploadHandler;