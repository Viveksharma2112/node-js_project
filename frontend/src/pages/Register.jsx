import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/leaderboard';
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container animate-fade-in-up">
      <div className="glass-panel auth-panel">
        <div className="auth-header">
          <h2>Create Player Profile</h2>
          <p>Join the arena and submit your high scores.</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              name="username" 
              className="glass-input" 
              placeholder="CyberNinja99"
              value={formData.username}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              className="glass-input" 
              placeholder="player@neonscore.com"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              className="glass-input" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          <button type="submit" className="btn-glow">
            <UserPlus size={20} />
            Register Profile
          </button>
        </form>

        <div className="auth-footer">
          <p>Already a player? <Link to="/login" className="accent-link">Login Here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
