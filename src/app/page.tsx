"use client";
import React, { useState, useEffect, FormEvent } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import markdownit from 'markdown-it';

const md = markdownit();

function LoginStatus() {
  const { data: session } = useSession();
  if (session && session.user) {
    return (
      <div className="login-status">
        Signed in as {session.user.name} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  return (
    <div className="login-status">
      Not signed in <br />
      <button onClick={() => signIn("twitter")}>Sign in with Twitter</button>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const [markdown, setMarkdown] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleClick = async (e: FormEvent) => {
    e.preventDefault();
    setMarkdown('');
    setIsStreaming(true);

    const eventSource = new EventSource(`/api/twitter`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMarkdown((prev) => prev + data.chunk);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
      setIsStreaming(false);
    };

    eventSource.addEventListener('done', () => {
      eventSource.close();
      setIsStreaming(false);
    });
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  return (
    <main className="main">
      <h1>Newsletter Generator</h1>
      <LoginStatus />
      {session && session.user && session.user.name && (
        <div>
          <button onClick={handleClick} disabled={isStreaming}>
            {isStreaming ? 'Streaming...' : 'Generate newsletter'}
          </button>
          <div className="markdown-container">
            <div className="markdown-edit">
              <h3>Raw Markdown</h3>
              <textarea
                value={markdown}
                onChange={handleMarkdownChange}
                disabled={isStreaming}
                placeholder="Markdown will appear here. You can edit it after generation."
              />
            </div>
            <div className="markdown-preview">
              <h3>Rendered Markdown</h3>
              <div dangerouslySetInnerHTML={{ __html: md.render(markdown) }} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
