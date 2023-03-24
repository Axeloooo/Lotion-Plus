import React from "react";

function Header({ user, profile, logout, openSidebar }) {
  return (
    <div className="app-header">
      <div className="app-title">
        <h1>Lotion</h1>
        <h5>Like Notion, but worse.</h5>
      </div>
      <div className="menu" onClick={openSidebar}>
        <p>&#9776;</p>
      </div>
      {profile ? (
        <div className="account">
          <p>{profile.name}</p>
          <div></div>
          <button onClick={logout}>(Log Out)</button>
        </div>
      ) : (
        <div className="account"></div>
      )}
    </div>
  );
}

export default Header;
