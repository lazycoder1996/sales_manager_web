import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        {children}
      </main>
    </div>
  )
}

export default AppLayout