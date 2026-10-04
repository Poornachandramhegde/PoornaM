import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout.js';
import { Dashboard } from './pages/Dashboard.js';
import { Schedule } from './pages/Schedule.js';
import { Todo } from './pages/Todo.js';
import { BucketList } from './pages/BucketList.js';
import { Settings } from './pages/Settings.js';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="todo" element={<Todo />} />
          <Route path="bucket" element={<BucketList />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
