import React from "react";
import logo from "./logo.svg";
import { Counter } from "./features/counter/Counter";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Auctions from "./pages/Auctions";
import ApplicationBar from "./components/generic/ApplicationBar";
import { publicProvider } from "wagmi/providers/public";
import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
import { sepolia, localhost } from "viem/chains";
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [localhost],
  [publicProvider()]
);
const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

function App() {
  return (
    <WagmiConfig config={config}>
      <div className="App">
        <ApplicationBar></ApplicationBar>
        <Routes>
          <Route path="/" element={<Auctions />} />
        </Routes>
      </div>
    </WagmiConfig>
  );
}

export default App;
