import { Menu } from "lucide-react"

function Topbar({ onMenuClick }) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar-menu-button"
        onClick={onMenuClick}
        title="Open menu"
        aria-label="Open menu"
      >
        <Menu
          size={20}
          strokeWidth={2}
        />
      </button>

      <div>
        <p className="eyebrow">Overview</p>
        <h2>Assalamu alaikum</h2>
      </div>

      {/* <div className="topbar-actions">
        <button className="secondary-button">
          Refresh
        </button>

        <div className="user-avatar">
          M
        </div>
      </div> */}
    </header>
  )
}

export default Topbar