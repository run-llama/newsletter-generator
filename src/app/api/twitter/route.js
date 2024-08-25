import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { NextRequest, NextResponse } from 'next/server';
import { ContextChatEngine, OpenAI } from "llamaindex";

const exampleNewsletter = `
Hi there, Llama Lovers! 🦙

Welcome to this week's edition of the LlamaIndex newsletter! We're excited to bring you updates including the Multimodal Report Generation Guide, a revamped Multi-Agent Concierge Workflow, robust Box integration for efficient data management, and innovative Event-Driven RAG Templates. Check out these developments along with our comprehensive guides and tutorials to maximize your use of these new features.

If you haven't explored LlamaCloud yet, make sure to [sign up](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vY2xvdWQubGxhbWFpbmRleC5haS8_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.B9HxgI_xC7eIgKsEodBvEK0FJXFHXj7EvCu410HSBCU) and [get in touch with us](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vd3d3LmxsYW1haW5kZXguYWkvY29udGFjdD9fX3M9Nmd3cWx1aWR0MWd6d3BmZzUxNWcmdXRtX3NvdXJjZT1kcmlwJnV0bV9tZWRpdW09ZW1haWwmdXRtX2NhbXBhaWduPUxsYW1hSW5kZXgrbmV3cysyMDI0LTA4LTIwIn0.zqORSoAdeGESIIAfmACPjZ863uiPPUqQinCxRvNyXlE) to discuss your specific enterprise use case.

🤩 The highlights:

-   Multimodal Report Generation Guide: Build a multi-agent system with LlamaParse and LlamaIndex to generate detailed reports combining text and images from complex data. [Notebook](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vZ2l0aHViLmNvbS9ydW4tbGxhbWEvbGxhbWFfcGFyc2UvYmxvYi9tYWluL2V4YW1wbGVzL211bHRpbW9kYWwvbXVsdGltb2RhbF9yZXBvcnRfZ2VuZXJhdGlvbl9hZ2VudC5pcHluYj9fX3M9Nmd3cWx1aWR0MWd6d3BmZzUxNWcmdXRtX3NvdXJjZT1kcmlwJnV0bV9tZWRpdW09ZW1haWwmdXRtX2NhbXBhaWduPUxsYW1hSW5kZXgrbmV3cysyMDI0LTA4LTIwIn0.9nxoZZP3Rg962m-8d0dKZVHTdAuce_cpNVkenzsn31o), [Tweet](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vbGxhbWFfaW5kZXgvc3RhdHVzLzE4MjQ0ODM0NzUzMzgxNzA1NDE_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.eTJAUMB5P-ntUZZiw2WPeFmED5LO1enUZat0vTTLebU).

-   Multi-Agent Concierge Workflow: Redesign of our financial concierge system with LlamaIndex's enhanced Workflows for improved looping, branching, debugging, and visualization. [Video](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9RHFpSURNeHVvS0EmZmVhdHVyZT15b3V0dS5iZSZfX3M9Nmd3cWx1aWR0MWd6d3BmZzUxNWcmdXRtX3NvdXJjZT1kcmlwJnV0bV9tZWRpdW09ZW1haWwmdXRtX2NhbXBhaWduPUxsYW1hSW5kZXgrbmV3cysyMDI0LTA4LTIwIn0.tUgYSd1uzJJzgaCUkx-B91lJqDqiPmaPaSZHWmyS43s), [Tweet](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vbGxhbWFfaW5kZXgvc3RhdHVzLzE4MjM0MjUxOTk3MDQwMzk4NjM_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.kg1V_9CUHbfO4YUV2IWpIaAxvuy0JUY9Ks6Ehq2uKbc).

-   Event-Driven RAG Templates: Use our event-driven workflows to implement techniques from key RAG papers---LongRAG, CorrectiveRAG, Self-Discover RAG---with added visualization and debugging, available as templates or for custom development. [Tweet](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vbGxhbWFfaW5kZXgvc3RhdHVzLzE4MjQ4MzMyODM5MjgyNjQ5NTI_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.dExYqJV4QFMV7DMLQ-eE9qOi9jvYl0eUW70h621vEVE).

-   Box Integration in LlamaIndex: New Box Readers integrated into LlamaIndex workflows facilitate efficient data extraction and authentication for enhanced AI applications. [Blogpost](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vbWVkaXVtLmNvbS9ib3gtZGV2ZWxvcGVyLWJsb2cvaW50cm9kdWNpbmctYm94LWxsYW1hLWluZGV4LXJlYWRlci0xMzkwMzQ0MmE5ZTY_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.b3gIkDDo-ffTyRANEoyQd9NRQWJ7DFn8Eb9rn9qU3HE), [Tweet](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vbGxhbWFfaW5kZXgvc3RhdHVzLzE4MjM0NjQ1MTMzMDEzMDc3ODc_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.rNHHgklNexuEoP6Bkispa3OVGjTWgj-T3E3g0Ncs9M0).

🗺️ LlamaCloud And LlamaParse:

-   Guide to Building a Multimodal Report Generation Agent using LlamaParse and LlamaIndex workflows to develop a multi-agent system that generates detailed reports with text and images from complex data sources. [Notebook](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vZ2l0aHViLmNvbS9ydW4tbGxhbWEvbGxhbWFfcGFyc2UvYmxvYi9tYWluL2V4YW1wbGVzL211bHRpbW9kYWwvbXVsdGltb2RhbF9yZXBvcnRfZ2VuZXJhdGlvbl9hZ2VudC5pcHluYj9fX3M9Nmd3cWx1aWR0MWd6d3BmZzUxNWcmdXRtX3NvdXJjZT1kcmlwJnV0bV9tZWRpdW09ZW1haWwmdXRtX2NhbXBhaWduPUxsYW1hSW5kZXgrbmV3cysyMDI0LTA4LTIwIn0.9nxoZZP3Rg962m-8d0dKZVHTdAuce_cpNVkenzsn31o), [Tweet](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vbGxhbWFfaW5kZXgvc3RhdHVzLzE4MjQ0ODM0NzUzMzgxNzA1NDE_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.eTJAUMB5P-ntUZZiw2WPeFmED5LO1enUZat0vTTLebU).

✨ Framework:

1.  Event-Driven Templates for Advanced RAG + Agent Techniques of three key RAG and agent papers - LongRAG, CorrectiveRAG, Self-Discover RAG, using our event-driven workflows, complete with visualization and debug features, available as templates or for custom development. [Tweet](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vbGxhbWFfaW5kZXgvc3RhdHVzLzE4MjQ4MzMyODM5MjgyNjQ5NTI_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.dExYqJV4QFMV7DMLQ-eE9qOi9jvYl0eUW70h621vEVE).

2.  We have integrated Box documents into LlamaIndex workflows with new Box Readers, enabling efficient data extraction, authentication, and retrieval to enhance your LLM applications with robust, data-driven AI solutions. [Blogpost](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vbWVkaXVtLmNvbS9ib3gtZGV2ZWxvcGVyLWJsb2cvaW50cm9kdWNpbmctYm94LWxsYW1hLWluZGV4LXJlYWRlci0xMzkwMzQ0MmE5ZTY_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.b3gIkDDo-ffTyRANEoyQd9NRQWJ7DFn8Eb9rn9qU3HE), [Tweet](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vbGxhbWFfaW5kZXgvc3RhdHVzLzE4MjM0NjQ1MTMzMDEzMDc3ODc_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.rNHHgklNexuEoP6Bkispa3OVGjTWgj-T3E3g0Ncs9M0).

3.  Multi-Agent Concierge as a Workflow, re-implementation of our financial concierge system using LlamaIndex's new Workflows abstraction, which supports looping, branching, debugging, and automatic visualization. [Video](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9RHFpSURNeHVvS0EmZmVhdHVyZT15b3V0dS5iZSZfX3M9Nmd3cWx1aWR0MWd6d3BmZzUxNWcmdXRtX3NvdXJjZT1kcmlwJnV0bV9tZWRpdW09ZW1haWwmdXRtX2NhbXBhaWduPUxsYW1hSW5kZXgrbmV3cysyMDI0LTA4LTIwIn0.tUgYSd1uzJJzgaCUkx-B91lJqDqiPmaPaSZHWmyS43s), [Tweet](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vbGxhbWFfaW5kZXgvc3RhdHVzLzE4MjM0MjUxOTk3MDQwMzk4NjM_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.kg1V_9CUHbfO4YUV2IWpIaAxvuy0JUY9Ks6Ehq2uKbc).

✍️ Community:

-   [Dave Bechberger's](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vYmVjaGJkP19fcz02Z3dxbHVpZHQxZ3p3cGZnNTE1ZyZ1dG1fc291cmNlPWRyaXAmdXRtX21lZGl1bT1lbWFpbCZ1dG1fY2FtcGFpZ249TGxhbWFJbmRleCtuZXdzKzIwMjQtMDgtMjAifQ.Bkhxa2Q2i8lgfxq4_wtCnVcPi3VF0YlbLOEWF80y11o) [tutorial](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vbWVkaXVtLmNvbS9AYmVjaGJkL2tub3dsZWRnZS1ncmFwaHMtYW5kLWdlbmVyYXRpdmUtYWktZ3JhcGhyYWctd2l0aC1hbWF6b24tbmVwdHVuZS1hbmQtbGxhbWFpbmRleC1wYXJ0LTEtMzljZDcyNTViYWM0P19fcz02Z3dxbHVpZHQxZ3p3cGZnNTE1ZyZ1dG1fc291cmNlPWRyaXAmdXRtX21lZGl1bT1lbWFpbCZ1dG1fY2FtcGFpZ249TGxhbWFJbmRleCtuZXdzKzIwMjQtMDgtMjAifQ.GyTy-xqaAm8zdXsTu02NsMZmEXJX95r-kam_VjrEuqk) on Building a Natural Language Querying System for Graph Databases using LlamaIndex with Amazon Neptune to translate natural language into openCypher queries, execute them, and optimize with Amazon Bedrock's LLMs.

-   [Ravi Theja's](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vcmF2aXRoZWphZHM_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.xOiaEEasueSf5o0bGsCYxrp-QZ87tAhNp6NGMokuULE) video [tutorial](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9U2ttNzBzR2FNRTQmX19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9._oW9mXRj16Kr_qJVZGN5ytoIVbf9hLm2PaNE6F4u8as) on rebuilding JSONalyze Query Engine using workflows.

-   [BeyondLLM](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vZ2l0aHViLmNvbS9haXBsYW5ldGh1Yi9iZXlvbmRsbG0_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.fUcexYBSegIm3TJjM_VyfsF0_zbCLy3-kpbAzbD210k) by AI Planet Hub simplifies the development of advanced RAG pipelines to 5-7 lines of code, with features like auto-retrieval, reranking, and embedding fine-tuning. It integrates with Arize AI Phoenix for comprehensive evaluation and observability.

-   [Richmond Alake's](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vcmljaG1vbmRhbGFrZT9fX3M9Nmd3cWx1aWR0MWd6d3BmZzUxNWcmdXRtX3NvdXJjZT1kcmlwJnV0bV9tZWRpdW09ZW1haWwmdXRtX2NhbXBhaWduPUxsYW1hSW5kZXgrbmV3cysyMDI0LTA4LTIwIn0.99hnkZqAiDeAVwYMtmIO8HFpwww5mTOHuOjOkIgvSx4) [video tutorial](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9VWZCUXhsX1BlMXcmX19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.VdtaMBb_Rwh5uZ0Ki4Yoh4eVUkRCB0_Mp5Jm6lMXBbk) on implementing Agentic RAG Using Claude 3.5 Sonnet, LlamaIndex, and MongoDB.

-   Rajib Deb's [video tutorial](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9VUZDcEY2VzJqM3cmX19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.dY9gyUMrSwUa2CDv_1odeEHtrQyc8jUYGfJbjEGv5aY) on Workflows, highlighting decorators for control flow, event-driven chaining, and custom orchestration steps.

-   [Tomaz Bratanic's](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vdGJfdG9tYXo_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.xYStGw2U57DpY4_WIw7hnp0By2DzKrSHZ1psAXUMBkQ) Neo4j [tutorial](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vbWVkaXVtLmNvbS9uZW80ai9lbnRpdHktbGlua2luZy1hbmQtcmVsYXRpb25zaGlwLWV4dHJhY3Rpb24td2l0aC1yZWxpay1pbi1sbGFtYWluZGV4LWNhMTg4OTJjMTY5Zj9fX3M9Nmd3cWx1aWR0MWd6d3BmZzUxNWcmdXRtX3NvdXJjZT1kcmlwJnV0bV9tZWRpdW09ZW1haWwmdXRtX2NhbXBhaWduPUxsYW1hSW5kZXgrbmV3cysyMDI0LTA4LTIwIn0.p4I1MNJQFC2TCYzYrBqqV31zgI3gaW0zpQk66K7aZPw) demonstrates using the Relik framework for information extraction, integrating spaCy, Coreferee, LlamaIndex, and Neo4j for entity linking, relationship extraction, and graph-based question answering.

-   [Andrei](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vX25lcmRhaV8_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.vYcEn7RPCFjEsK-LVHzCkXoLJqyjuHrZ3PijeqAHhKI) [video tutorial](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9M3lHLS1IS3htaTgmX19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.3PiuTXzksKAon7mHFK6FhL3mEixSoENiBh5Erj3z9Ms) on discussing llama-agents, our framework for building multi-agent systems with a focus on production use cases.

-   [Ravi Theja's](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8veC5jb20vcmF2aXRoZWphZHM_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.xOiaEEasueSf5o0bGsCYxrp-QZ87tAhNp6NGMokuULE) video [tutorial](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9UDR4SFdvaklCLU0mX19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.rbXIQ7t0RLdu6QIeRLfpzEuEz523ROEZfK0keUIJ_F4) on re-building our Citation Query Engine using workflows.

-   [Farzad Sunavala's](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vaGFzaG5vZGUuY29tL0BGYXJ6enk1Mjg_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.l7UFLxVdNVNigPaaqlxq4wHQDhWV7A0K7gxV2GLXv0E) [guide](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vZmFyenp5Lmhhc2hub2RlLmRldi9leHBsb3JpbmctbGxhbWFpbmRleC13b3JrZmxvd3MtYS1zdGVwLWJ5LXN0ZXAtZ3VpZGUtdG8tYnVpbGRpbmctYS1yYWctc3lzdGVtLXdpdGgtYXp1cmUtYWktc2VhcmNoLWFuZC1henVyZS1vcGVuYWk_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.xGpgP6HAaxY6UzKWLrYF_q5V9PW5WqFy-38CxJOkuYM) to Building a RAG System with Azure AI Search and Azure OpenAI using LlamaIndex workflows.

-   [Benito Martin's](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vbWVkaXVtLmNvbS9AYmVuaXRvbWFydGluP19fcz02Z3dxbHVpZHQxZ3p3cGZnNTE1ZyZ1dG1fc291cmNlPWRyaXAmdXRtX21lZGl1bT1lbWFpbCZ1dG1fY2FtcGFpZ249TGxhbWFJbmRleCtuZXdzKzIwMjQtMDgtMjAifQ.b63OzZt-u1foVtH8tTrwPzsy-tINWyJx4Bgj4bJnm4U) [tutorial](https://t.dripemail2.com/c/eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZXRvdXIiLCJpc3MiOiJtb25vbGl0aCIsInN1YiI6ImRldG91cl9saW5rIiwiaWF0IjoxNzI0MTU5NzY4LCJuYmYiOjE3MjQxNTk3NjgsImFjY291bnRfaWQiOiI5NzE5NDc3IiwiZGVsaXZlcnlfaWQiOiI5dHVtaGU3ZmVibXU5aGdxd3FxbyIsInVybCI6Imh0dHBzOi8vbWVkaXVtLmNvbS9AYmVuaXRvbWFydGluL2Nvb2tpbmctd2l0aC1haS1idWlsZGluZy1hLXNtYXJ0LW11bHRpbW9kYWwtcmVjaXBlLXJlY29tbWVuZGVyLXVzaW5nLXFkcmFudC1sbGFtYWluZGV4LWFuZC0yZDZkMWZhNjU2NmM_X19zPTZnd3FsdWlkdDFnendwZmc1MTVnJnV0bV9zb3VyY2U9ZHJpcCZ1dG1fbWVkaXVtPWVtYWlsJnV0bV9jYW1wYWlnbj1MbGFtYUluZGV4K25ld3MrMjAyNC0wOC0yMCJ9.5NFDzxs3QyrDmnQZ0_kBcZnaCpnLU6S5Rvn8732AeUM) on Building a Smart Multimodal Recipe Recommender using Qdrant, LlamaIndex, and Google Gemini.
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

    console.log(tweets)

    const llm = new OpenAI({
        model: "gpt-4o-mini",
        temperature: 0.2,
        streaming: true,
        openai_api_key: process.env.OPENAI_API_KEY,
    });

    const stream = new ReadableStream({
        async start(controller) {
            const response = await llm.complete({
                prompt: `
                    Your task is to generate a newsletter based on the last 7 days of tweets 
                    from our Twitter account.

                    Here are all of the tweets:
                    ${tweets.data.map(tweet => tweet.text).join('\n')}

                    Here is a sample newsletter we have generated previously:
                    ${exampleNewsletter}
                `,
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
