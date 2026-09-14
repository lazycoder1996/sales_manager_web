function Topbar() {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Overview</p>
        <h2>Good morning</h2>
      </div>

      <div className="topbar-actions">
        <button className="secondary-button">
          Refresh
        </button>

        <div className="user-avatar">
          M
        </div>
      </div>
    </header>
  )
}

export default Topbar