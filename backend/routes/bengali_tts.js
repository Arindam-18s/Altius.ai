// const express = require('express');
// const router = express.Router();

// router.post('/speak', async (req, res) => {
//   const { text, language } = req.body;
//   if (!text) return res.status(400).json({ error: 'Text is required' });
//   if (language !== 'ben') {
//     return res.status(400).json({ error: 'This endpoint is Bengali-only' });
//   }

//   try {
//     const response = await fetch(
//       'https://api-inference.huggingface.co/models/facebook/mms-tts-ben',
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
//           'Content-Type': 'application/json',
//         },
//         method: 'POST',
//         body: JSON.stringify({ inputs: text }),
//       }
//     );

//     if (!response.ok) {
//       const errText = await response.text();
//       console.error('HF TTS error:', response.status, errText);
//       throw new Error(`HF ${response.status}: ${errText.substring(0, 100)}`);
//     }

//     const audioBuffer = await response.arrayBuffer();
//     const base64Audio = Buffer.from(audioBuffer).toString('base64');

//     res.json({ audioUrl: `data:audio/wav;base64,${base64Audio}` });
//   } catch (err) {
//     console.error('Bengali TTS FULL ERROR:', err);
//     res.status(500).json({ error: 'TTS generation failed', details: err.message });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const googleTTS = require('@sefinek/google-tts-api');

router.post('/speak', async (req, res) => {
  const { text, language } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const langCode = language === 'ben' ? 'bn' : language === 'hi' ? 'hi' : 'en';

  try {
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: langCode,
      slow: false,
      host: 'https://translate.google.co.in',
      splitPunct: '।,?!',   // Bengali danda + common punctuation
    });

    // results is an array: [{ shortText, base64 }, ...]
    // Combine all base64 chunks into one audio string
    const combinedBase64 = results.map(r => r.base64).join('');
    const combinedText = results.map(r => r.shortText).join(' ');

    res.json({
      audioUrl: `data:audio/mp3;base64,${combinedBase64}`,
      chunks: results.length,
      textLength: combinedText.length,
    });
  } catch (err) {
    console.error('Bengali TTS FULL ERROR:', err);
    res.status(500).json({ error: 'TTS generation failed', details: err.message });
  }
});

module.exports = router;