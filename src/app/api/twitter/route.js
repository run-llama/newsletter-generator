import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI, Anthropic } from "llamaindex";
import util from 'node:util';

const exampleNewsletter = `
Hi there, Llama Lovers! 🦙

Welcome to this week's edition of the LlamaIndex newsletter! We're excited to bring you updates including the Multimodal Report Generation Guide, a revamped Multi-Agent Concierge Workflow, robust Box integration for efficient data management, and innovative Event-Driven RAG Templates. Check out these developments along with our comprehensive guides and tutorials to maximize your use of these new features.

If you haven't explored LlamaCloud yet, make sure to [sign up](https://cloud.llamaindex.ai/) and [get in touch with us](https://www.llamaindex.ai/contact) to discuss your specific enterprise use case.

🤩 **The highlights:**

-   **Multimodal Report Generation Guide:** Build a multi-agent system with LlamaParse and LlamaIndex to generate detailed reports combining text and images from complex data. [Notebook](https://github.com/run-llama/llama_parse/blob/main/examples/multimodal/multimodal_report_generation_agent.ipynb), [Tweet](https://x.com/llama_index/status/1824483475338170541).
-   **Multi-Agent Concierge Workflow:** Redesign of our financial concierge system with LlamaIndex's enhanced Workflows for improved looping, branching, debugging, and visualization. [Video](https://www.youtube.com/watch?v=DqiIDMxuoKA&feature=youtu.be), [Tweet](https://x.com/llama_index/status/1823425199704039863).
-   **Event-Driven RAG Templates:** Use our event-driven workflows to implement techniques from key RAG papers---LongRAG, CorrectiveRAG, Self-Discover RAG---with added visualization and debugging, available as templates or for custom development. [Tweet](https://x.com/llama_index/status/1824833283928264952).
-   **Box Integration in LlamaIndex:** New Box Readers integrated into LlamaIndex workflows facilitate efficient data extraction and authentication for enhanced AI applications. [Blogpost](https://medium.com/box-developer-blog/introducing-box-llama-index-reader-13903442a9e6), [Tweet](https://x.com/llama_index/status/1823464513301307787).

**☁️ LlamaParse:**

-   Guide to Building a Multimodal Report Generation Agent using LlamaParse and LlamaIndex workflows to develop a multi-agent system that generates detailed reports with text and images from complex data sources. [Notebook](https://github.com/run-llama/llama_parse/blob/main/examples/multimodal/multimodal_report_generation_agent.ipynb), [Tweet](https://x.com/llama_index/status/1824483475338170541).

**✨ Framework:**

1.  Event-Driven Templates for Advanced RAG + Agent Techniques of three key RAG and agent papers - LongRAG, CorrectiveRAG, Self-Discover RAG, using our event-driven workflows, complete with visualization and debug features, available as templates or for custom development. [Tweet](https://x.com/llama_index/status/1824833283928264952).
2.  We have integrated Box documents into LlamaIndex workflows with new Box Readers, enabling efficient data extraction, authentication, and retrieval to enhance your LLM applications with robust, data-driven AI solutions. [Blogpost](https://medium.com/box-developer-blog/introducing-box-llama-index-reader-13903442a9e6), [Tweet](https://x.com/llama_index/status/1823464513301307787).
3.  Multi-Agent Concierge as a Workflow, re-implementation of our financial concierge system using LlamaIndex's new Workflows abstraction, which supports looping, branching, debugging, and automatic visualization. [Video](https://www.youtube.com/watch?v=DqiIDMxuoKA&feature=youtu.be), [Tweet](https://x.com/llama_index/status/1823425199704039863).

`

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

function listTweets(tweets) {
    return tweets.map( (tweet) => {
        if (tweet.note_tweet) {
            return tweet.note_tweet.text
        } else {
            return tweet.text
        }
    }).join('\n')    
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
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log('Twitter API error:', response.status, errorData);
            return new Response(JSON.stringify({ error: "Failed to fetch Twitter User ID", details: errorData }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            })
        }
        
        const data = await response.json()
        if (!data.data || !data.data.id) {
            console.log('Unexpected Twitter API response:', data);
            return new Response(JSON.stringify({ error: "Invalid response from Twitter API", details: data }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            })
        }
        
        userId = data.data.id
    } catch (error) {
        console.log('Error fetching Twitter User ID:', error)
        return new Response(JSON.stringify({ error: "Failed to fetch Twitter User ID", details: error.message }), {
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
        "note_tweet"
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

        if (response.status === 429) {
            // Rate limit exceeded
            const rateLimitReset = response.headers.get('x-rate-limit-reset');
            const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : 'unknown';
            const errorData = await response.json().catch(() => ({}));
            console.log('Twitter API rate limit exceeded. Reset at:', resetTime);
            return new Response(JSON.stringify({ 
                error: "Twitter API rate limit exceeded", 
                message: `Rate limit exceeded. Please try again after ${resetTime}`,
                resetTime: resetTime,
                details: errorData
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log('Twitter API error:', response.status, errorData);
            return new Response(JSON.stringify({ 
                error: "Twitter API call failed", 
                status: response.status,
                details: errorData
            }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        tweets = await response.json()
    } catch (error) {
        console.log('Error fetching tweets:', error);
        return new Response(JSON.stringify({ 
            error: "Error fetching recent tweets", 
            message: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    function addUtmParams(url) {
        try {
            const urlObj = new URL(url);
            const host = urlObj.hostname || '';
            // Add utm_source=newsletter to any LlamaIndex-related domains
            if (host.includes('llamaindex')) {
                urlObj.searchParams.set('utm_source', 'newsletter');
                return urlObj.toString();
            }
            return url;
        } catch {
            // If URL parsing fails, return original URL
            return url;
        }
    }

    if (tweets.data) {
        for (const tweet of tweets.data) {
            const tweetText = tweet.note_tweet?.text || tweet.text;
            if (tweetText) {
                // Use a Set to handle duplicate t.co URLs in a single tweet
                const tcoUrls = [...new Set(tweetText.match(/https:\/\/t\.co\/[a-zA-Z0-9]+/g) || [])];
                if (tcoUrls.length > 0) {
                    const resolvedPairs = await Promise.all(
                        tcoUrls.map(async (url) => {
                            try {
                                const response = await fetch(url);
                                let resolved = response.url;
                                // Add UTM params if URL contains llamaindex.ai
                                resolved = addUtmParams(resolved);
                                return { original: url, resolved: resolved };
                            } catch (e) {
                                console.log(`Could not resolve ${url}`);
                                return { original: url, resolved: url }; // keep original on error
                            }
                        })
                    );
                    
                    for (const { original, resolved } of resolvedPairs) {
                        // Use global replace to handle multiple occurrences of the same t.co URL
                        const searchRegExp = new RegExp(original.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                        if (tweet.note_tweet && tweet.note_tweet.text) {
                            tweet.note_tweet.text = tweet.note_tweet.text.replace(searchRegExp, resolved);
                        }
                        if (tweet.text) {
                            tweet.text = tweet.text.replace(searchRegExp, resolved);
                        }
                    }
                }
            }
        }
    }

    // list all the tweets
    let tweetsList = listTweets(tweets.data) 

    // get the top 3 most liked tweets for highlights
    let mostLiked = tweets.data.sort((a, b) => b.public_metrics.like_count - a.public_metrics.like_count).slice(0, 3)
    let mostLikedList = listTweets(mostLiked)

    // Optional user-provided highlights/CTAs to feature at the very top
    const { searchParams } = new URL(request.url);
    const highlightsFromRequest = searchParams.get('highlights') || '';

    const highlightsPromptSection = highlightsFromRequest.trim()
        ? `
                    You have also been given additional "Highlights and CTAs" content that should be surfaced at the very top of the newsletter, immediately after the introductory paragraph.

                    Here is that additional content (URLs and context):
                    -----------
                    ${highlightsFromRequest}
                    -----------

                    Based on this content, invent a short, attention-grabbing markdown section title (3–8 words) and create a dedicated section directly after the intro paragraph. Do NOT hard-code the title to any fixed phrase; always derive it from the content. Summarize this content into clear bullet points with strong calls to action, and ensure each bullet links to the provided URLs.
            `
        : `
                    If no extra "Highlights and CTAs" content is provided, do not add such a special top section.
            `;

    // const llm = new OpenAI({
    //     model: "gpt-4o-mini",
    //     temperature: 0.2,
    //     streaming: true,
    //     openai_api_key: process.env.OPENAI_API_KEY,
    // });
    const llm = new Anthropic({
        model: "claude-sonnet-4-20250514",
        streaming: true,
        apiKey: process.env.ANTHROPIC_API_KEY
    })

    const stream = new ReadableStream({
        async start(controller) {
            const response = await llm.complete({
                prompt: `
                    Your task is to generate a newsletter based on the last 7 days of tweets 
                    from our Twitter account.

                    Here are all of the tweets:
                    ${tweetsList}

                    Here is a sample newsletter we have generated previously:
                    ---------
                    ${exampleNewsletter}
                    ---------

                    Important features to note:
                    * Vary the greeting from "Llama Lovers" to something Llama-related, like "Llama Fans" or "Llama Enthusiasts"
                    * Use the following rules for sections and headings:
                        * If any extra "Highlights and CTAs" content is provided, create a custom-titled section (you choose a short, attention-grabbing title based on the content) immediately after the intro paragraph, using that content.
                        * Then add a section titled "The Highlights" (most liked tweets, see below).
                        * Then add a section titled "LlamaParse" for tweets that mention llamacloud, llamasplit, llamaextract, llamasheets or llamaparse.
                        * Then add a section titled "Framework" for tweets that are about changes to the llamaindex framework itself.
                        * Do not create a "Community" section.
                    * Each section should have a bullet point list of items.
                    * Each item should link to the relevant blog post, tutorial, etc. from the tweet.
                     
                    The highlights section should focus on the most-liked tweets; these are:
                    -----------
                    ${mostLikedList}
                    -----------

                    ${highlightsPromptSection}
                `,
                stream: true
            })
            for await (const chunk of response) {
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

}
