'use client'
import styles from "./page.module.css";
import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect, FormEvent } from 'react';
import markdownit from 'markdown-it'

const md = markdownit()

function LoginStatus() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session.user.name} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn("twitter")}>Sign in with Twitter</button>
    </>
  )
}

export default function Home() {
  const { data: session } = useSession()
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleClick = async (e: FormEvent) => {
    e.preventDefault();
    setResponse('');
    setIsStreaming(true);

    const eventSource = new EventSource(`/api/twitter`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResponse((prev) => prev + data.chunk);
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

  return (
    <main className={styles.main}>
      <LoginStatus />
      {session?.user.name && (
        <div>
          <button onClick={handleClick} disabled={isStreaming}>
            {isStreaming ? 'Streaming...' : 'Generate newsletter'}
          </button>
          { response && (
            <div dangerouslySetInnerHTML={{ __html: md.render(response) }}>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
