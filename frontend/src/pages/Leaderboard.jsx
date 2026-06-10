import { useState, useEffect } from 'react';
import { Trophy, Plus, Medal } from 'lucide-react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newScore, setNewScore] = useState('');
  
  const token = localStorage.getItem('token');
  const getUserIdFromToken = (t) => {
    if (!t) return null;
    try {
      const payload = t.split('.')[1];
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return json.user?.id || json.user?._id || null;
    } catch (e) {
      return null;
    }
  };
  const currentUserId = getUserIdFromToken(token);

  const fetchScores = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leaderboard/top');
      const data = await res.json();
      setScores(data);
    } catch (err) {
      console.error('Failed to fetch scores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    try {
      await fetch('http://localhost:5000/api/leaderboard/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ score: Number(newScore) })
      });
      setNewScore('');
      setShowForm(false);
      fetchScores();
    } catch (err) {
      console.error('Failed to submit score', err);
    }
  };

  return (
    <div className="leaderboard-container animate-fade-in-up">
      <div className="leaderboard-header">
        <div>
          <h2><Trophy className="inline-icon text-accent" size={32} /> Global Leaderboard</h2>
          <p>Top players from around the world.</p>
        </div>
        
        {token && (
          <button className="btn-glow btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> Submit Score
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmitScore} className="glass-panel score-form animate-fade-in-up">
          <div className="form-group" style={{flex: 1}}>
            <input 
              type="number" 
              className="glass-input" 
              placeholder="Enter your score..." 
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-glow btn-sm" style={{width: 'auto'}}>Confirm</button>
        </form>
      )}

      <div className="glass-panel table-container">
        {loading ? (
          <div className="loading-state">Loading ranks...</div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, index) => (
                <tr key={s._id} className={index < 3 ? `top-${index + 1}` : ''}>
                  <td>
                    <div className="rank-badge">
                      {index === 0 && <Medal color="#FFD700" size={20} />}
                      {index === 1 && <Medal color="#C0C0C0" size={20} />}
                      {index === 2 && <Medal color="#CD7F32" size={20} />}
                      {index > 2 && `#${index + 1}`}
                    </div>
                  </td>
                  <td className="player-name">{s.user?.username || 'Unknown'}</td>
                  <td className="score-value">{s.score.toLocaleString()}</td>
                  <td className="date-value">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    {token && currentUserId && s.user && s.user._id === currentUserId && (
                      <button
                        className="btn-delete"
                        onClick={async () => {
                          try {
                            await fetch(`http://localhost:5000/api/leaderboard/${s._id}`, {
                              method: 'DELETE',
                              headers: { 'x-auth-token': token }
                            });
                            fetchScores();
                          } catch (err) {
                            console.error('Failed to delete score', err);
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {scores.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-state">No scores submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
