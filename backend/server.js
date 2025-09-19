const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
// Render 会自动设置 PORT 环境变量，我们应该使用它
const PORT = process.env.PORT || 3000;

// --- START: 更健壮的 CORS 配置 ---

// 1. 定义我们明确允许的前端地址
const allowedOrigins = ['https://xiaoshuo-1.onrender.com'];

const corsOptions = {
  origin: function (origin, callback) {
    // 允许来自我们定义列表中的地址的请求
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  // 明确允许的方法
  methods: ['POST', 'OPTIONS'],
  // 明确允许的请求头
  allowedHeaders: ['Content-Type', 'Authorization'],
  // 为预检请求（OPTIONS）返回一个成功的状态码
  optionsSuccessStatus: 200
};

// 2. 全局应用这个更详细的 CORS 配置
// 这将为我们所有的路由正确地处理 OPTIONS 预检请求
app.use(cors(corsOptions));

// --- END: 更健壮的 CORS 配置 ---

app.use(express.json());

const ALIYUN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

app.post('/api/generate', async (req, res) => {
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

// 使用 Render 提供的端口来启动服务
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});