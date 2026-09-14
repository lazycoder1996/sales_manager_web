import { NavLink } from "react-router-dom"
import {
  Boxes,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  X,
} from "lucide-react"

function Sidebar({
  isOpen,
  onClose,
}) {
  function handleNavigation() {
    onClose()
  }

  return (
    <>
      <div
        className={`sidebar-overlay ${
          isOpen ? "visible" : ""
        }`}
        onClick={onClose}
      />

      <aside
        className={`sidebar ${
          isOpen ? "open" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-mark">
            SM
          </div>

          <div>
            <h1>Sales Manager</h1>
            <p>Uniform Inventory</p>
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            title="Close menu"
          >
            <X
              size={19}
              strokeWidth={2}
            />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            onClick={handleNavigation}
            className={({ isActive }) =>
              isActive
                ? "nav-item active"
                : "nav-item"
            }
          >
            <LayoutDashboard
              size={18}
              strokeWidth={2}
            />
            Dashboard
          </NavLink>

          <NavLink
            to="/sales"
            onClick={handleNavigation}
            className={({ isActive }) =>
              isActive
                ? "nav-item active"
                : "nav-item"
            }
          >
            <ShoppingCart
              size={18}
              strokeWidth={2}
            />
            Sales
          </NavLink>

          <NavLink
            to="/stock"
            onClick={handleNavigation}
            className={({ isActive }) =>
              isActive
                ? "nav-item active"
                : "nav-item"
            }
          >
            <Boxes
              size={18}
              strokeWidth={2}
            />
            Stock
          </NavLink>

          <NavLink
            to="/sellers"
            onClick={handleNavigation}
            className={({ isActive }) =>
              isActive
                ? "nav-item active"
                : "nav-item"
            }
          >
            <Store
              size={18}
              strokeWidth={2}
            />
            Sellers
          </NavLink>

          <NavLink
            to="/products"
            onClick={handleNavigation}
            className={({ isActive }) =>
              isActive
                ? "nav-item active"
                : "nav-item"
            }
          >
            <Package
              size={18}
              strokeWidth={2}
            />
            Products
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <p>School Uniform Store</p>
          <span>Inventory workspace</span>
        </div>
      </aside>
    </>
  )
}

export default Sidebar