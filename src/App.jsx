import { useEffect, useState } from 'react'
import './App.css'

const COINS_URL =
  'https://g1vgmu8nxa.execute-api.us-east-1.amazonaws.com/dev/coins'

async function getCoins(limit, start) {
  const response = await fetch(
    `${COINS_URL}?limit=${limit}&start=${start}`,
    { signal: AbortSignal.timeout(15000) },
  )

  if (!response.ok) {
    throw new Error('Could not load coins. Please try again.')
  }

  const data = await response.json()

  if (!Array.isArray(data.coins)) {
    throw new Error('The server returned invalid coin data.')
  }

  return data.coins
}

function App() {
  const [coins, setCoins] = useState([])
  const [input, setInput] = useState({ limit: '5', start: '0' })
  const [githubData, setGithubData] = useState(null)
  const [githubError, setGithubError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    getCoins(5, 0)
      .then((data) => {
        if (!ignore) setCoins(data)
      })
      .catch(() => {
        if (!ignore) {
          setError('Could not load coins. Please try again.')
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    async function loadGithubProfile() {
      try {
        const response = await fetch(
          'https://api.github.com/users/ugursalih',
          { signal: AbortSignal.timeout(15000) },
        )

        if (!response.ok) throw new Error('Profile unavailable')

        const data = await response.json()

        if (!data.login) throw new Error('Invalid profile')

        if (!ignore) setGithubData(data)
      } catch {
        if (!ignore) setGithubError(true)
      }
    }

    loadGithubProfile()

    return () => {
      ignore = true
    }
  }, [])

  function updateInputValues(type, value) {
    setInput((previous) => ({ ...previous, [type]: value }))
  }

  async function fetchCoins(event) {
    event.preventDefault()

    if (loading) return

    const limit = Number(input.limit)
    const start = Number(input.start)

    if (
      input.limit.trim() === '' ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      setError('Limit must be a whole number between 1 and 100.')
      return
    }

    if (
      input.start.trim() === '' ||
      !Number.isSafeInteger(start) ||
      start < 0
    ) {
      setError('Start must be a whole number of 0 or greater.')
      return
    }

    setLoading(true)
    setError('')
    setCoins([])

    try {
      const data = await getCoins(limit, start)
      setCoins(data)
    } catch {
      setError(
        'Could not load coins. Check your connection and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="App" style={{ padding: '30px' }}>
      <h1>Crypto Coin App</h1>

      <form
        onSubmit={fetchCoins}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
        }}
      >
        <label htmlFor="limit">Limit:</label>
        <input
          id="limit"
          type="number"
          min="1"
          max="100"
          step="1"
          required
          value={input.limit}
          disabled={loading}
          onChange={(event) =>
            updateInputValues('limit', event.target.value)
          }
          style={{
            width: '130px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #9ca3af',
          }}
        />

        <label htmlFor="start">Start:</label>
        <input
          id="start"
          type="number"
          min="0"
          step="1"
          required
          value={input.start}
          disabled={loading}
          onChange={(event) =>
            updateInputValues('start', event.target.value)
          }
          style={{
            width: '130px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #9ca3af',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 25px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Loading...' : 'Fetch Coins'}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            marginBottom: '20px',
          }}
        >
          {error}
        </p>
      )}

      <section aria-label="Coin results" aria-busy={loading}>
        {loading ? (
          <p role="status" style={{ padding: '40px' }}>
            Loading coins...
          </p>
        ) : coins.length === 0 && !error ? (
          <p role="status">No coins found. Try a different Start value.</p>
        ) : (
          coins.map((coin, index) => {
            const price =
              coin.price_usd === null ||
              coin.price_usd === undefined ||
              coin.price_usd === ''
                ? NaN
                : Number(coin.price_usd)

            return (
              <article
                key={coin.id ?? `${coin.symbol}-${index}`}
                style={{
                  borderBottom: '1px solid #d1d5db',
                  padding: '20px 0',
                }}
              >
                <h2 style={{ margin: '0 0 5px' }}>
                  {coin.name} ({coin.symbol})
                </h2>
                <p style={{ margin: 0, color: '#4b5563' }}>
                  Price:{' '}
                  <span
                    style={{ color: '#166534', fontWeight: 'bold' }}
                  >
                    {Number.isFinite(price)
                      ? price.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        })
                      : 'Unavailable'}
                  </span>
                </p>
              </article>
            )
          })
        )}
      </section>

      <footer
        style={{
          marginTop: '40px',
          borderTop: '2px solid #d1d5db',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        {githubData?.avatar_url && (
          <img
            src={githubData.avatar_url}
            alt="ugursalih GitHub avatar"
            width="50"
            height="50"
            style={{ borderRadius: '50%' }}
          />
        )}

        <div>
          <a
            href="https://github.com/ugursalih"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#1d4ed8', fontWeight: 'bold' }}
          >
            Developer: {githubData?.login ?? 'ugursalih'}
          </a>

          {githubData?.created_at && (
            <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
              GitHub account created on:{' '}
              {new Date(githubData.created_at).toLocaleDateString(
                'en-US',
              )}
            </p>
          )}

          {githubError && (
            <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
              GitHub profile details are currently unavailable.
            </p>
          )}
        </div>
      </footer>
    </main>
  )
}

export default App