import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">

      <div className="logo">
        ☁️ Cloud Storage
      </div>

      <button className="new-btn">
        + New
      </button>

      <div className="menu">

        <Link to="/dashboard" className="active">
          🏠 My Drive
        </Link>

        <a href="#">
          ⭐ Starred
        </a>

        <a href="#">
          🕒 Recent
        </a>

        <a href="#">
          👥 Shared
        </a>

        <a href="#">
          🗑 Trash
        </a>

      </div>

      <div className="storage">

        <p>Storage</p>

        <div className="progress">

          <div className="progress-bar"></div>

        </div>

        <small>15% Used</small>

      </div>

    </div>
  );
}

export default Sidebar;