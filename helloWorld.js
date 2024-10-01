import OpenAI from "openai";
const openAI = new OpenAI();

const complation = await openAI.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {role: "system", content: "You are a helpful assistant"},
        {role: "user", content: "Write a haiku about recursion in programming."}
    ]
})

console.log(complation);
