import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";

const chat = new ChatOpenAI();

chat.temperature = 1;
const questionAnswerProblemsResponse = await chat.call([
    new HumanChatMessage(
        "Give me three question-answer problems, " +
            "where the answer requires multiple steps of reasoning.\n\n" +
            "Reply with an array of JSON objects and nothing else.\n" +
            "Each JSON object should have the following structure:\n" +
            "{" +
            '"question":"<replace with the question>",' +
            '"answer":"<replace with the answer>"' +
            "}"
    ),
]);
console.log(questionAnswerProblemsResponse.text);

chat.temperature = 0;
const missingTextResponse = await chat.call([
    new SystemChatMessage(
        "You are given question-answer problems with a missing text.\n" +
            "Your task is to guess what the missing text must be.\n" +
            "The missing text is the same for all the given problems.\n\n" +
            "Reply with the following JSON object and nothing else:\n" +
            '{"missingText":"<replace with the missing text>"}'
    ),
    new HumanChatMessage(
        JSON.stringify(
            JSON.parse(questionAnswerProblemsResponse.text).map(
                ({ question, answer }: { question: string; answer: string }) => ({
                    question,
                    answer: `Let us <missing text>. ${answer}`,
                })
            ),
            null,
            2
        )
    ),
]);
const missingText = JSON.parse(missingTextResponse.text)?.missingText || "think step by step";
console.log(missingTextResponse.text);
console.log(missingText);

chat.temperature = 0;
const answeredQuestionsResponse = await chat.call([
    new SystemChatMessage(
        "You are given a list of questions.\n" +
            "Your task is to complete each answer.\n\n" +
            "Reply with an array of JSON objects and nothing else.\n" +
            "Each JSON object should have the following structure:\n" +
            "{" +
            '"question":"<replace with the question>",' +
            `"answer":"<replace with the answer, it should always start with 'Let us ${missingText}.'>"` +
            "}"
    ),
    new HumanChatMessage(
        JSON.stringify(
            JSON.parse(questionAnswerProblemsResponse.text).map(
                ({ question, answer }: { question: string; answer: string }) => ({
                    question,
                    answer: `<replace with the answer, it should always start with 'Let us ${missingText}.'>`,
                })
            ),
            null,
            2
        )
    ),
]);
console.log(answeredQuestionsResponse.text);
