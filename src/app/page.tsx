'use client'
import styles from "./page.module.css";
import { useSession, signIn, signOut } from "next-auth/react"

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

  return (
    <main className={styles.main}>
      <LoginStatus />
    </main>
  );
}
