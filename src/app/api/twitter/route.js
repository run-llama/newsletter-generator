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

**🗺️ LlamaCloud And LlamaParse:**

-   Guide to Building a Multimodal Report Generation Agent using LlamaParse and LlamaIndex workflows to develop a multi-agent system that generates detailed reports with text and images from complex data sources. [Notebook](https://github.com/run-llama/llama_parse/blob/main/examples/multimodal/multimodal_report_generation_agent.ipynb), [Tweet](https://x.com/llama_index/status/1824483475338170541).

**✨ Framework:**

1.  Event-Driven Templates for Advanced RAG + Agent Techniques of three key RAG and agent papers - LongRAG, CorrectiveRAG, Self-Discover RAG, using our event-driven workflows, complete with visualization and debug features, available as templates or for custom development. [Tweet](https://x.com/llama_index/status/1824833283928264952).
2.  We have integrated Box documents into LlamaIndex workflows with new Box Readers, enabling efficient data extraction, authentication, and retrieval to enhance your LLM applications with robust, data-driven AI solutions. [Blogpost](https://medium.com/box-developer-blog/introducing-box-llama-index-reader-13903442a9e6), [Tweet](https://x.com/llama_index/status/1823464513301307787).
3.  Multi-Agent Concierge as a Workflow, re-implementation of our financial concierge system using LlamaIndex's new Workflows abstraction, which supports looping, branching, debugging, and automatic visualization. [Video](https://www.youtube.com/watch?v=DqiIDMxuoKA&feature=youtu.be), [Tweet](https://x.com/llama_index/status/1823425199704039863).

**✍️ Community:**

-   [Dave Bechberger's](https://x.com/bechbd) [tutorial](https://medium.com/@bechbd/knowledge-graphs-and-generative-ai-graphrag-with-amazon-neptune-and-llamaindex-part-1-39cd7255bac4) on Building a Natural Language Querying System for Graph Databases using LlamaIndex with Amazon Neptune to translate natural language into openCypher queries, execute them, and optimize with Amazon Bedrock's LLMs.
-   [Ravi Theja's](https://x.com/ravithejads) video [tutorial](https://www.youtube.com/watch?v=Skm70sGaME4) on rebuilding JSONalyze Query Engine using workflows.
-   [BeyondLLM](https://github.com/aiplanethub/beyondllm) by AI Planet Hub simplifies the development of advanced RAG pipelines to 5-7 lines of code, with features like auto-retrieval, reranking, and embedding fine-tuning. It integrates with Arize AI Phoenix for comprehensive evaluation and observability.
-   [Richmond Alake's](https://x.com/richmondalake) [video tutorial](https://www.youtube.com/watch?v=UfBQxl_Pe1w) on implementing Agentic RAG Using Claude 3.5 Sonnet, LlamaIndex, and MongoDB.
-   Rajib Deb's [video tutorial](https://www.youtube.com/watch?v=UFCpF6W2j3w) on Workflows, highlighting decorators for control flow, event-driven chaining, and custom orchestration steps.
-   [Tomaz Bratanic's](https://x.com/tb_tomaz) Neo4j [tutorial](https://medium.com/neo4j/entity-linking-and-relationship-extraction-with-relik-in-llamaindex-ca18892c169f) demonstrates using the Relik framework for information extraction, integrating spaCy, Coreferee, LlamaIndex, and Neo4j for entity linking, relationship extraction, and graph-based question answering.
-   [Andrei](https://x.com/_nerdai_) [video tutorial](https://www.youtube.com/watch?v=3yG--HKxmi8) on discussing llama-agents, our framework for building multi-agent systems with a focus on production use cases.
-   [Ravi Theja's](https://x.com/ravithejads) video [tutorial](https://www.youtube.com/watch?v=P4xHWojIB-M) on re-building our Citation Query Engine using workflows.
-   [Farzad Sunavala's](https://hashnode.com/@Farzzy528) [guide](https://farzzy.hashnode.dev/exploring-llamaindex-workflows-a-step-by-step-guide-to-building-a-rag-system-with-azure-ai-search-and-azure-openai) to Building a RAG System with Azure AI Search and Azure OpenAI using LlamaIndex workflows.
-   [Benito Martin's](https://medium.com/@benitomartin) [tutorial](https://medium.com/@benitomartin/cooking-with-ai-building-a-smart-multimodal-recipe-recommender-using-qdrant-llamaindex-and-2d6d1fa6566c) on Building a Smart Multimodal Recipe Recommender using Qdrant, LlamaIndex, and Google Gemini.
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

        if (response.status !== 200) {
            console.log(response)
            return new Response(JSON.stringify({ error: "Twitter API call failed" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        tweets = await response.json()
    } catch (error) {
        return new Response(JSON.stringify({ error: "Error fetching recent tweets" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    console.log(util.inspect(tweets,{depth: 4}))

    // list all the tweets
    let tweetsList = listTweets(tweets.data) 

    // get the top 3 most liked tweets for highlights
    let mostLiked = tweets.data.sort((a, b) => b.public_metrics.like_count - a.public_metrics.like_count).slice(0, 3)
    let mostLikedList = listTweets(mostLiked)

    const llm = new OpenAI({
        model: "gpt-4o-mini",
        temperature: 0.2,
        streaming: true,
        openai_api_key: process.env.OPENAI_API_KEY,
    });
    // const llm = new Anthropic({
    //     model: "claude-3-5-sonnet",
    //     temperature: 0.2,
    //     streaming: true,
    //     apiKey: process.env.ANTHROPIC_API_KEY
    // })

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
                    * The headings should be:
                        * The Highlights (most liked tweets, see below)
                        * LlamaCloud & LlamaParse (tweets that mention llamacloud or llamaparse)
                        * Framework (tweets that are about changes to the llamaindex framework itself)
                        * Community (everything else)
                    * Each section should have a bullet point list of items
                    * Each item should link to the relevant blog post, tutorial, etc. from the tweet.
                     
                    The highlights section should focus on the most-liked tweets; these are:
                    -----------
                    ${mostLikedList}
                    -----------
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
