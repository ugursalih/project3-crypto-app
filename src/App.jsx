import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [coins, updateCoins] = useState([])
  const [input, updateInput] = useState({ limit: 5, start: 0 })
  
  // TALİMAT: GitHub verisi ve Yükleme durumu için state'ler
  const [githubData, setGithubData] = useState({})
  const [loading, setLoading] = useState(true) // Challenge 1: Loading state

  function updateInputValues(type, value) {
    updateInput({ ...input, [type]: value })
  }

  // Kripto verilerini çeken fonksiyon
  async function fetchCoins() {
    setLoading(true) // Veri çekilmeye başlarken loading'i aktif et
    try {
      const { limit, start } = input
      const API_URL = `https://g1vgmu8nxa.execute-api.us-east-1.amazonaws.com/dev/coins?limit=${limit}&start=${start}`;
      
      const response = await fetch(API_URL);
      const data = await response.json();
      updateCoins(data.coins || []);
      setLoading(false) // Veri gelince loading'i kapat
    } catch (err) {
      // Challenge 2: Hata yönetimi
      console.error('Error fetching coins:', err);
      setLoading(false)
    }
  }

  // GitHub verilerini çeken fonksiyon (ugursalih kullanıcısı için)
  async function fetchGithubData() {
    try {
      const response = await fetch('https://api.github.com/users/ugursalih');
      const data = await response.json();
      setGithubData(data);
    } catch (err) {
      console.error('GitHub Error:', err);
    }
  }

  useEffect(() => {
    fetchCoins();
    fetchGithubData();
  }, [])

  return (
    <div className="App" style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Crypto Coin App</h1>
      
      <div style={{ marginBottom: '20px', backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
        <label style={{ fontWeight: 'bold' }}>Limit: </label>
        <input
          type="number"
          placeholder="Limit"
          onChange={e => updateInputValues('limit', e.target.value)}
          style={{ marginRight: '20px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        
        <label style={{ fontWeight: 'bold' }}>Start: </label>
        <input
          type="number"
          placeholder="Start"
          onChange={e => updateInputValues('start', e.target.value)}
          style={{ marginRight: '20px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        
        <button 
          onClick={fetchCoins}
          style={{ 
            padding: '10px 25px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Fetch Coins
        </button>
      </div>

      {/* Challenge 1: Loading Durumu Gösterimi */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2 style={{ color: '#007bff' }}>Loading coins... Please wait.</h2>
        </div>
      ) : (
        // Veriler yüklendiğinde listeyi göster
        coins.map((coin, index) => (
          <div key={index} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
            <h2 style={{ margin: '0 0 5px 0' }}>{coin.name} ({coin.symbol})</h2>
            <p style={{ margin: '0', color: '#555' }}>
              Price: <span style={{ color: '#28a745', fontWeight: 'bold' }}>${parseFloat(coin.price_usd).toFixed(2)}</span>
            </p>
          </div>
        ))
      )}

      {/* GitHub Bilgisi (Challenge'daki son adım) */}
      <div style={{ 
        marginTop: '50px', 
        borderTop: '2px solid #eee', 
        paddingTop: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        {githubData.avatar_url && (
          <img 
            src={githubData.avatar_url} 
            alt="Profile" 
            style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
          />
        )}
        <div>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>Developer: {githubData.login}</p>
          <p style={{ margin: 0, color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>
            GitHub account created on: {githubData.created_at ? new Date(githubData.created_at).toLocaleString() : "Fetching date..."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App