import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './AppLayout';
import Hero from './RockPaperScissors/hero';
import TicTacToe from './TicTacToe/hero';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />} />
        <Route path="/rps" element={<Hero />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
      </Routes>
    </Router>
  );
}

export default App;
