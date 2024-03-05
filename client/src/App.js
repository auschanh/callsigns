import { Routes, Route } from 'react-router-dom';
import './App.css';
import io from "socket.io-client";
import { useState } from 'react';

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState(""); 
  const [room, setRoom] = useState(""); 

  const joinRoom = () => {

  }
  return (
    <div className="App">
      <Routes>
        <Route path='/' exact element={<Home/>} />
        <Route path='game' exact element={<Game/>} />
        <Route path='howtoplay' exact element={<HowToPlay/>} />
      </Routes>
    </div>
  );
}

export default App;
