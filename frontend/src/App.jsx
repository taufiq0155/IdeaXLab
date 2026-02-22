import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/visitor/Home'
import BlogsHome from './pages/visitor/BlogsHome'
import TeamHome from './pages/visitor/teamHome'
import ServiceHome from './pages/visitor/ServiceHome'
import ProjectHome from './pages/visitor/projectHome'
import ResearchHome from './pages/visitor/researchHome'
import InnovationHome from './pages/visitor/innovationHome'
import NewsHome from './pages/visitor/newHome'
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
import Profile from './pages/admin/profile'
import GetService from './pages/admin/Service/GetService'
import ViewService from './pages/admin/Service/ViewService'
import AddEmployee from './pages/admin/Employee/AddEmployee'
import ViewEmployee from './pages/admin/Employee/ViewEmployee'
import ModifyEmployee from './pages/admin/Employee/ModifyEmployee'
import AddProject from './pages/admin/Project/AddProject'
import ViewProject from './pages/admin/Project/ViewProject'
import ModifyProject from './pages/admin/Project/ModifyProject'
import AddInnovation from './pages/admin/Innovation/AddInnovation'
import ViewInnovation from './pages/admin/Innovation/ViewInnovation'
import ModifyInnovation from './pages/admin/Innovation/ModifyInnovation'
import AddResearch from './pages/admin/Research/AddResearch'
import ViewResearch from './pages/admin/Research/ViewResearch'
import ModifyResearch from './pages/admin/Research/ModifyResearch'
import AddNews from './pages/admin/News/AddNews'
import ViewNews from './pages/admin/News/ViewNews'
import ModifyNews from './pages/admin/News/ModifyNews'

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
            <Route path="/blogs" element={<BlogsHome />} />
            <Route path="/projects" element={<ProjectHome />} />
            <Route path="/research" element={<ResearchHome />} />
            <Route path="/innovation" element={<InnovationHome />} />
            <Route path="/news" element={<NewsHome />} />
            <Route path="/services" element={<ServiceHome />} />
            <Route path="/team" element={<TeamHome />} />
            <Route path="/team/:category" element={<TeamHome />} />
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
              <Route path="profile" element={<Profile />} />

              <Route path="services">
                <Route index element={<Navigate to="/admin/services/get" replace />} />
                <Route path="get" element={<GetService />} />
                <Route path="view" element={<ViewService />} />
              </Route>

              <Route path="employees">
                <Route index element={<Navigate to="/admin/employees/add" replace />} />
                <Route path="add" element={<AddEmployee />} />
                <Route path="view" element={<ViewEmployee />} />
                <Route path="modify" element={<ModifyEmployee />} />
              </Route>

              <Route path="projects">
                <Route index element={<Navigate to="/admin/projects/add" replace />} />
                <Route path="add" element={<AddProject />} />
                <Route path="view" element={<ViewProject />} />
                <Route path="modify" element={<ModifyProject />} />
              </Route>

              <Route path="innovations">
                <Route index element={<Navigate to="/admin/innovations/add" replace />} />
                <Route path="add" element={<AddInnovation />} />
                <Route path="view" element={<ViewInnovation />} />
                <Route path="modify" element={<ModifyInnovation />} />
              </Route>

              <Route path="research">
                <Route index element={<Navigate to="/admin/research/add" replace />} />
                <Route path="add" element={<AddResearch />} />
                <Route path="view" element={<ViewResearch />} />
                <Route path="modify" element={<ModifyResearch />} />
              </Route>

              <Route path="news">
                <Route index element={<Navigate to="/admin/news/add" replace />} />
                <Route path="add" element={<AddNews />} />
                <Route path="view" element={<ViewNews />} />
                <Route path="modify" element={<ModifyNews />} />
              </Route>
              
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
