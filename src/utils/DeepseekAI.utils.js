
// import { OpenAI } from "openai";
// import express from 'express'
// const startServer = (req,res,next) => {
 
//   const app= express()

//   const client = new OpenAI({
//     apiKey: process.env.DEEPSEEK_API_KEY,
//     baseURL: 'https://api.deepseek.com'
//   });

//   let conversation = [
//     { 
//         role: 'system',
//          content: 'You are a knowledgeable tutor for an educational website.' }
//   ];

//   const getAIResponse = async (userMessage) => {
//     conversation.push({ role: 'user', content: userMessage });
//     const completion = await client.chat.completions.create({
//       model: 'deepseek-chat',
//       messages: conversation,
//       stream: false
//     });


//     const aiResponse = completion.choices[0].message.content;
//     conversation.push({ role: 'assistant', content: aiResponse });
//     return aiResponse;
//   };

//   app.post('/api/chat', async (req, res) => {
//     const { message } = req.body;
//     if (!message) {
//       return res.status(400).json({ error: 'Message is required' });
//     }
//     try {
//       const aiResponse = await getAIResponse(message);
//       res.json({ response: aiResponse });
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ error: 'An error occurred while processing your request' });
//     }
//   });

  
// };next()

// export default startServer