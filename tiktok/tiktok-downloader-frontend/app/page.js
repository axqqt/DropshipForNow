"use client"
import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/get_video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `url=${encodeURIComponent(url)}`,
      })
      const data = await response.json()
      setResult(data.hdplay_url)
    } catch (error) {
      console.error('Error:', error)
      setResult('Failed to get video URL')
    }
    setLoading(false)
  }

  return (
    <div className="container">
      <Head>
        <title>TikTok Video Downloader</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">TikTok Video Downloader</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter TikTok Video URL"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Get Video'}
          </button>
        </form>

        {result && (
          <div className="result">
            <h2>Result:</h2>
            <a href={result} target="_blank" rel="noopener noreferrer">
              {result}
            </a>
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }

        form {
          margin-top: 2rem;
        }

        input {
          padding: 0.5rem;
          font-size: 1rem;
          width: 300px;
        }

        button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          cursor: pointer;
        }

        button:disabled {
          background-color: #ccc;
        }

        .result {
          margin-top: 2rem;
          text-align: center;
        }
      `}</style>
    </div>
  )
}