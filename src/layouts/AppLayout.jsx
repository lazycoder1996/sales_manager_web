import { useState } from "react"

import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function openSidebar() {
    setSidebarOpen(true)
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <main className="main-content">
        <Topbar
          onMenuClick={openSidebar}
        />

        {children}
      </main>
    </div>
  )
}

export default AppLayout