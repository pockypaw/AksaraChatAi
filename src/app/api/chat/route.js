// const OpenAI = require("openai");
// const { OpenAIStream, StreamingTextResponse } = require("ai");

// // Create an OpenAI API client (that's edge friendly!)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // IMPORTANT! Set the runtime to edge
// export const runtime = "edge";

// export async function POST(req) {
//   const { messages } = await req.json();

//   console.log(messages);

//   // Ask OpenAI for a streaming chat completion given the prompt
//   const response = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     stream: true,
//     messages: [
//       {
//         role: "system",
//         content:
//           "You are a helpful assistant. You explain software concepts simply to intermediate programmers.",
//       },
//       ...messages,
//     ],
//   });

//   // console.log(response);

//   // Convert the response into a friendly text-stream
//   const stream = OpenAIStream(response);

//   // console.log(stream);
//   // Respond with the stream
//   return new StreamingTextResponse(stream);
// }

const OpenAI = require("openai");
const { OpenAIStream, StreamingTextResponse } = require("ai");

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req) {
  let { messages } = await req.json();

  console.log(messages);
  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: messages[0].content,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: "asst_klXH4RHJ58JEM6Gg1bsxwe7G",
  });

  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  while (runStatus.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  messages = await openai.beta.threads.messages.list(thread.id);

  const lastMessageForRun = messages.data
    .filter(
      (message) => message.run_id === run.id && message.role === "assistant"
    )
    .pop();

  let hasil = "";
  if (lastMessageForRun && lastMessageForRun.content[0]?.text?.value) {
    hasil = lastMessageForRun.content[0].text.value;
    console.log(hasil);
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: hasil }],
    stream: true,
  });

  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk.choices[0]?.delta?.content || "");
  }

  // Join all the chunks into a single string
  let result = chunks.join("");

  console.log(result);

  const processedResult =
    result != null && result !== "" ? result : "Masih memproses AI";

  // Respond with the result or the processing message
  return new StreamingTextResponse(processedResult);
}
