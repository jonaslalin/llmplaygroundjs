import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";

const chat = new ChatOpenAI();

let response;

response = await chat.call([new HumanChatMessage("Tell me a joke.")]);
console.log(response.text);

response = await chat.call([
    new SystemChatMessage(
        "Your task is to tell me funny jokes.\n" +
            "Only reply with a minified JSON object using the following JSON schema:\n" +
            "{\n" +
            '    "$schema": "https://json-schema.org/draft/2020-12/schema",\n' +
            '    "$id": "https://example.com/joke.schema.json",\n' +
            '    "title": "Joke",\n' +
            '    "description": "A joke from ChatGPT",\n' +
            '    "type": "object",\n' +
            '    "properties": {\n' +
            '        "answer": {\n' +
            '            "description": "The answer to the joke",\n' +
            '            "type": "string"\n' +
            "        },\n" +
            '        "question": {\n' +
            '            "description": "The joke",\n' +
            '            "type": "string"\n' +
            "        }\n" +
            "    },\n" +
            '    "required": ["answer", "question"]\n' +
            "}"
    ),
    new HumanChatMessage("Tell me a joke about an apple and a banana."),
]);
console.log(response.text);
console.log(JSON.parse(response.text));
