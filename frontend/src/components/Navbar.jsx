import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Trophy, LogOut, User as UserIcon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          <Gamepad2 className="logo-icon" size={28} />
          <span>NeonScore</span>
        </Link>
        <div className="navbar-links">
          <Link to="/leaderboard" className="nav-link">
            <Trophy size={18} />
            Leaderboard
          </Link>
          {token ? (
            <>
              <span className="nav-user">
                <UserIcon size={18} />
                {user?.username}
              </span>
              <button onClick={handleLogout} className="btn-secondary nav-logout">
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-glow btn-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
