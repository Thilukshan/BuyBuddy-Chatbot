import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import getKnowledgeBase from "./retrievals.js";
import {retriveId, ProductRetrival, PRE_ORDER} from "../product_db.js"
import dotenv from "dotenv";

dotenv.config();

const { GOOGLE_GENAI_API_KEY, GOOGLE_GENAI_CHAT_MODEL } = process.env;

const googleGenAI = new ChatGoogleGenerativeAI({
    model: GOOGLE_GENAI_CHAT_MODEL,
    apiKey: GOOGLE_GENAI_API_KEY,
    temperature: 0,
});

const intentPrompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are a query classifier for **BuyBuddy**, an e-commerce AI chatbot.

            Classify the user query into **ONLY ONE** of the following categories:

                - **POLICY** → General information such as returns, refunds, shipping, payments, store hours, account help, or navigation steps
                - **ORDER** → Tracking, checking, updating, or asking about a **specific order or shipment**
                - **RECOMMENDATION** → Requests to suggest, find, or explore products (bestsellers, trending items, personalized suggestions)
                - **NOT_RELEVANT** → Queries unrelated to e-commerce or unclear in intent

        ### Rules:
                - Respond with **ONLY ONE WORD**
                - Valid outputs: **POLICY**, **ORDER**, **RECOMMENDATION**, **NOT_RELEVANT**
                - Do not add explanations, punctuation, or extra text

        Respond with only the category name.`,
    ],
    [
        "human",
        `
    User Question: {input}
    Previous Conversations: {history}`,
    ],
]);

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `
        You are **BuyBuddy**, a friendly, helpful, and concise e-commerce chatbot. You always respond based on the available Knowledge Base and previous conversation context.
        
        ### Rules:
        - Greet the user **only once** at the beginning of the conversation. After that, continue naturally.
        - Use **simple, polite, and human-like language**.
        - Use **previous conversation context** when it helps the user.
        - When giving steps or instructions, use a **clear, numbered list**.
        - Always **bold titles** and **important list items**.
        - If something is unclear, ask **one short and relevant follow-up question**.
        - If the user asks something **unrelated to e-commerce**, politely refuse and mention that the service is limited to **BuyBuddy online marketplace**.
        - If the Knowledge Base does not have the requested information, reply exactly with:
                **"I'm sorry, I don't have that information right now."**
                    You may ask a short clarifying question **only if it helps**.
        - use **LKR** as currency

        Only respond with the final answer. Do not mention the rules or the Knowledge Base explicitly.
  `,
    ],
    [
        "human",
        `
        **Knowledge Base:** {knowledgeBase}

        **Previous Messages:** {history}

        **User Question:** {input}
  `,
    ],
]);

const parser = new StringOutputParser();

const intentChain = intentPrompt.pipe(googleGenAI).pipe(parser);
const chain = prompt.pipe(googleGenAI).pipe(parser);

export const handleGeneralLogic = async (input) => {
    const knowledgeBase = await getKnowledgeBase(input);
    return knowledgeBase.length ? knowledgeBase.map((x) => x.pageContent) : "Knowledge base is empty";
};

export const handleOrderLogic = async (input) => {
    const orderId = retriveId(input);
    if (!orderId) {
        return `Missing Order ID. Please provide your order number like "#<ORDER_ID>".`;
    }
    return (
        PRE_ORDER[parseInt(orderId)] || `No order found for ID #${orderId}`
    );
};

export const handleRecommendationLogic = () => {
    return ProductRetrival();
};

const handleIntent = async (intent, input) => {
    let data = null;

    if (intent === "POLICY") {
        data = await handleGeneralLogic(input);
    } else if (intent === "ORDER") {
        data = await handleOrderLogic(input);
    } else if (intent === "RECOMMENDATION") {
        data = await handleRecommendationLogic();
    } else {
        data = `Sorry, I cannot handle this request.`
    }

    return data;
};

const llmStream = async (messages) => {
    const historyMessages = messages.slice(0, -1);
    const input = messages[messages.length - 1].text;

    const history = historyMessages
        .map((m, i) => `${i}. ${m.role}: ${m.text}`)
        .join("\n");

    const intent = (
        await intentChain.invoke({ input, history })
    ).trim();
    console.log("Intent:", intent);

    const data = await handleIntent(intent, input);

    console.log(`${input}\n${history}\n${JSON.stringify(data)}\n`);

    const response = await chain.stream({
        input,
        history,
        knowledgeBase: JSON.stringify(data),
    });

    return response;
};

export default llmStream;








