import { FloorCanvas } from "./components/Canvas/FloorCanvas"
import { RoomPalette } from "./components/Sidebar/RoomPalette"

export default function App() {
  return (
    <main className="app">
      <RoomPalette />

      <section className="workspace">
        <FloorCanvas />
      </section>
    </main>
  )
}
