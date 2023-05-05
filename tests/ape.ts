import * as openai from "../src/openai";

async function main() {
    const chat = new openai.Chat();

    const questionAnswerProblemsResponse = await chat.getCompletion(
        [
            {
                role: "user",
                content:
                    "Give me three question-answer problems, " +
                    "where the answer requires multiple steps of reasoning.\n\n" +
                    "Reply with an array of JSON objects and nothing else.\n" +
                    "Each JSON object should have the following structure:\n" +
                    "{" +
                    '"question":"<replace with the question>",' +
                    '"answer":"<replace with the answer>"' +
                    "}",
            },
        ],
        { temperature: 0.9 }
    );

    const missingTextResponse = await chat.getCompletion(
        [
            {
                role: "system",
                content:
                    "You are given question-answer problems with a missing text.\n" +
                    "Your task is to guess what the missing text must be.\n" +
                    "The missing text is the same for all the given problems.\n\n" +
                    "Reply with the following JSON object and nothing else:\n" +
                    '{"missingText":"<replace with the missing text>"}',
            },
            {
                role: "user",
                content: JSON.stringify(
                    JSON.parse(questionAnswerProblemsResponse.content).map(
                        ({ question, answer }: { question: string; answer: string }) => ({
                            question,
                            answer: `Let us <missing text>. ${answer}`,
                        })
                    ),
                    null,
                    2
                ),
            },
        ],
        { temperature: 0 }
    );

    const missingText = JSON.parse(missingTextResponse.content)?.missingText || "think step by step";
    await chat.getCompletion(
        [
            {
                role: "system",
                content:
                    "You are given a list of questions.\n" +
                    "Your task is to complete each answer.\n\n" +
                    "Reply with an array of JSON objects and nothing else.\n" +
                    "Each JSON object should have the following structure:\n" +
                    "{" +
                    '"question":"<replace with the question>",' +
                    `"answer":"<replace with the answer, it should always start with 'Let us ${missingText}.'>"` +
                    "}",
            },
            {
                role: "user",
                content: JSON.stringify(
                    JSON.parse(questionAnswerProblemsResponse.content).map(
                        ({ question, answer }: { question: string; answer: string }) => ({
                            question,
                            answer: `<replace with the answer, it should always start with 'Let us ${missingText}.'>`,
                        })
                    ),
                    null,
                    2
                ),
            },
        ],
        { temperature: 0 }
    );
}

main().then(() => {}, console.error.bind(null));
