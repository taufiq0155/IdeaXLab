import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import AdminLogin from './pages/admin/adminLogin'
import AdminSignup from './pages/admin/adminsignup'
import AdminDashboard from './pages/admin/adminDashboard'
import ForgotPassword from './pages/admin/forgotPassword'
import { ThemeProvider } from './context/ThemeContext'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AllAdmins from './pages/admin/Admins/alladmins'
import PendingAdmins from './pages/admin/Admins/pendingAdmins'
import ChangePassword from './pages/admin/changePassword'
import Contact from './pages/admin/Contacts/contact'
import ContactedUser from './pages/admin/Contacts/contactedUser'
import BlogCategory from './pages/admin/Blog/BlogCategory'
import BlogCreate from './pages/admin/Blog/BlogCreate'
import BlogPage from './pages/admin/Blog/BlogPage'
import ModifyBlog from './pages/admin/Blog/ModifyBlog'
import ModifyBlogCategory from './pages/admin/Blog/ModifyBlogCategory'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-black">
          {/* Toast Notifications Container */}
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastClassName="bg-gray-800 text-white"
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
               
              <Route path="blog">
                <Route index element={<BlogPage />} />
                <Route path="create" element={<BlogCreate />} />
                <Route path="edit/:id" element={<ModifyBlog />} />
                <Route path="categories" element={<BlogCategory />} />
                <Route path="categories/edit" element={<ModifyBlogCategory />} />
              </Route>

              <Route path="contacts">
              <Route index element={<Navigate to="/admin/contacts/messages" replace />} />
              <Route path="messages" element={<ContactedUser />} />
              <Route path="compose" element={<Contact />} />
            </Route>
              <Route path="change-password" element={<ChangePassword />} />
              
              {/* Admin Management Routes */}
              <Route path="admins">
                <Route path="all" element={<AllAdmins />} />
                <Route path="pending" element={<PendingAdmins />} />
              </Route>
            </Route>
            
            {/* Redirect all unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App