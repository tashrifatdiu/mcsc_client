import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Club from './pages/Club';
import Olympiad from './pages/Olympiad';
import RegistrationRequest from './pages/RegistrationRequest';
import AdminVerify from './pages/AdminVerify';
import Dashboard from './pages/Dashboard';
import JournalEditor from './pages/JournalEditor';
import JournalList from './pages/JournalList';
import JournalDetail from './pages/JournalDetail';
import MyDrafts from './pages/MyDrafts';
import JournalGallery from './pages/JournalGallery';
import AuthorWorks from './pages/AuthorWorks';
import SignUp from './pages/SignUp';
import Login from './pages/Login';

function App() {
  return (
    <>
      <div className="scanlines"></div>
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
    <Route path="/club" element={<Club />} />
    <Route path="/olympiad" element={<Olympiad />} />
    <Route path="/registration-request" element={<RegistrationRequest />} />
    <Route path="/admin-verify" element={<AdminVerify />} />
    <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/journal" element={<JournalList />} />
          <Route path="/journal/new" element={<JournalEditor />} />
          <Route path="/journal/edit/:id" element={<JournalEditor />} />
          <Route path="/journal/drafts" element={<MyDrafts />} />
          <Route path="/journal/gallery" element={<JournalGallery />} />
          <Route path="/journal/author/:authorId" element={<AuthorWorks />} />
          <Route path="/journal/:id" element={<JournalDetail />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          {/* existing routes */}
        </Routes>
      </main>
    </>
  );
}

export default App;