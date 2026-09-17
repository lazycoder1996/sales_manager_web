import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import "./App.css"

import AppLayout from "./layouts/AppLayout"
import Dashboard from "./pages/Dashboard"
import Sales from "./pages/Sales"
import SaleDetail from "./pages/SaleDetail"
import Stock from "./pages/Stock"
import StockReceipts from "./pages/StockReceipts"
import Sellers from "./pages/Sellers"
import SellerDetail from "./pages/SellerDetail"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import StockDetail from "./pages/StockDetail"
import NewSale from "./pages/NewSale"
import Students from "./pages/Students"
import NewStudent from "./pages/NewStudent"
import StockReceiptDetail from "./pages/StockReceiptDetail"
import StudentDetail from "./pages/StudentDetail"
import EditStudent from "./pages/EditStudent"


function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/students/:studentId/edit"
            element={
              <EditStudent />
            }
          />
          <Route
            path="/students/:studentId"
            element={
              <StudentDetail />
            }
          />

          <Route
            path="/students/new"
            element={
              <NewStudent />
            }
          />
          <Route
            path="/sales/new"
            element={<NewSale />}
          />

          <Route
            path="/sales"
            element={<Sales />}
          />

          <Route
            path="/sales/:saleId"
            element={<SaleDetail />}
          />

          <Route
            path="/stock"
            element={<Stock />}
          />

          <Route
            path="/stock-receipts"
            element={<StockReceipts />}
          />

          <Route
            path="/students"
            element={
              <Students />
            }
          />

          <Route
            path="/stock-receipts/:receiptId"
            element={
              <StockReceiptDetail />
            }
          />
          <Route
            path="/sellers"
            element={<Sellers />}
          />

          <Route
            path="/sellers/:sellerId"
            element={<SellerDetail />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/:productId"
            element={<ProductDetail />}
          />

          <Route
            path="/stock/:productId"
            element={<StockDetail />}
          />

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App