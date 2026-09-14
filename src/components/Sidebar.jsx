import { NavLink } from "react-router-dom"
import {
  Boxes,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
} from "lucide-react"

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">SM</div>

        <div>
          <h1>Sales Manager</h1>
          <p>Uniform Inventory</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <LayoutDashboard size={18} strokeWidth={2} />
          Dashboard
        </NavLink>

        <NavLink
          to="/sales"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <ShoppingCart size={18} strokeWidth={2} />
          Sales
        </NavLink>

        <NavLink
          to="/stock"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Boxes size={18} strokeWidth={2} />
          Stock
        </NavLink>

        <NavLink
          to="/sellers"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Store size={18} strokeWidth={2} />
          Sellers
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Package size={18} strokeWidth={2} />
          Products
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>School Uniform Store</p>
        <span>Inventory workspace</span>
      </div>
    </aside>
  )
}

export default Sidebar