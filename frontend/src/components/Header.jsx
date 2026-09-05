function Header({ user }) {

  return (

    <div className="header">

      <div>

        <h2>My Drive</h2>

        <p>Welcome, {user?.name}</p>

      </div>

      <input

        type="text"

        placeholder="🔍 Search files..."

        className="search"

      />

      <div className="profile">

        👤 {user?.name}

      </div>

    </div>

  );

}

export default Header;