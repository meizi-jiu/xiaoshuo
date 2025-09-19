const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3173;

app.use(cors());
app.use(express.json());

const ALIYUN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

app.post('/api/generate', async (req, res) => {
  // 核心修改：从前端请求体中直接获取 apiKey
  const { apiKey, ...payload } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API Key is missing in the request.' });
  }

  try {
    const bailianPayload = {
      model: payload.model,
      input: {
        messages: payload.messages,
      },
      parameters: {
        temperature: payload.temperature,
        max_tokens: payload.max_tokens,
      },
    };

    // 核心修改：使用从前端传来的 apiKey
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    console.log('Forwarding request to Aliyun with user-provided key...');
    const apiResponse = await axios.post(ALIYUN_API_URL, bailianPayload, { headers });
    
    console.log('Received response from Aliyun.');
    res.json(apiResponse.data);

  } catch (error) {
    console.error('Error proxying request:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: 'Failed to fetch from Aliyun API',
      details: error.response ? error.response.data : null
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});