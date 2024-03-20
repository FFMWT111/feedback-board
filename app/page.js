"use client";

import Board from "./components/Board";
import { SessionProvider } from "next-auth/react";
import Header from "./components/Header";

export default function Home() {
  return (
    <SessionProvider>
      <Header />
      <Board />
    </SessionProvider>
  );
}
