import { Routes, Route } from "react-router-dom";
import { Daftar } from "./Daftar";
import { Detail } from "./Detail";

export function LpjContainer() {
  return (
    <Routes>
      <Route path="/" element={<Daftar />} />
      <Route path=":kementerianSlug" element={<Daftar />} />
      <Route path=":kementerianSlug/:judulSlug" element={<Detail />} />
    </Routes>
  );
}
