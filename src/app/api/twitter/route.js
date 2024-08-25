import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

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

  try {
    const url = `https://api.twitter.com/2/users/${userId}/tweets?max_results=100&start_time=${ten_days_ago}&tweet.fields=${fields}&expansions=${expansions}&media.fields=${media_fields}`
    console.log(url)
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch recent tweets" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
