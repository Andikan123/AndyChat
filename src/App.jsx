import { Routes, Route } from 'react-router-dom';
import AuthPage from './AuthPage';
import ChatPage from './Chat';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  );
}
export default App;