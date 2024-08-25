import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { NextRequest, NextResponse } from 'next/server';
import { ContextChatEngine, OpenAI } from "llamaindex";

function getDateDaysAgo(days) {
    // Create a new Date object for the current date
    const date = new Date();

    // Subtract days
    date.setDate(date.getDate() - days);

    // Set the time to 00:00:00
    date.setHours(0, 0, 0, 0);

    // Convert to ISO string and remove milliseconds
    let isoString = date.toISOString().split('.')[0] + 'Z';

    return isoString;
}

export async function GET(request) {
    const session = await getServerSession(authOptions)
    const encoder = new TextEncoder();

    if (!session || !session.accessToken) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    let userId = false
    try {
        const response = await fetch(`https://api.twitter.com/2/users/me`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`
            }
        })
        const data = await response.json()
        userId = data.data.id
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ error: "Failed to fetch Twitter User ID" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const ten_days_ago = getDateDaysAgo(10)
    const fields = [
        "id",
        "text",
        "attachments",
        "in_reply_to_user_id",
        "public_metrics",
    ].join(',')
    const expansions = [
        "attachments.media_keys"
    ].join(',')
    const media_fields = [
        "media_key",
        "type",
        "url"
    ].join(',')

    let tweets = false
    try {
        const url = `https://api.twitter.com/2/users/${userId}/tweets?max_results=100&start_time=${ten_days_ago}&tweet.fields=${fields}&expansions=${expansions}&media.fields=${media_fields}`
        console.log(url)
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`
            }
        })

        tweets = await response.json()
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch recent tweets" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const llm = new OpenAI({
        model: "gpt-4o-mini",
        temperature: 0.2,
        streaming: true,
        openai_api_key: process.env.OPENAI_API_KEY,
    });

    const stream = new ReadableStream({
        async start(controller) {
            const response = await llm.complete({
                prompt: "Please give me the first 3 paragraphs of Moby Dick, a book in the public domain.",
                stream: true
            })
            for await (const chunk of response) {
                console.log("Got a chunk")
                console.log(chunk)
                const message = `data: ${JSON.stringify({ chunk: chunk.text })}\n\n`;
                controller.enqueue(encoder.encode(message));
            }

            controller.close();
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });

    /*
    const response = await llm.complete({
        prompt: "Please give me the first 3 paragraphs of Moby Dick, a book in the public domain."
    })
    console.log(response)
    return new Response(response.text,
        {
            status: 200
        }
    )
    */

}
