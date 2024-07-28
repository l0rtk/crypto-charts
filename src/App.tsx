import React from "react";
import "./App.css";
import CryptoChart from "./components/CryptoChart";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Cryptocurrency Price Chart</h1>
        <CryptoChart />
      </header>
    </div>
  );
};

export default App;
