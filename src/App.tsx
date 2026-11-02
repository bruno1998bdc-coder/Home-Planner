import "./App.css"

import { FloorCanvas } from "./components/Canvas/FloorCanvas"
import { PropertiesPanel } from "./components/Sidebar/PropertiesPanel"
import { useHouseStore } from "./store/houseStore"

function App() {
  const addRoom = useHouseStore((state) => state.addRoom)
  const roomCount = useHouseStore((state) => state.house.rooms.length)

  function handleAddRoom() {
    addRoom("bedroom", {
      x: 2 + roomCount,
      y: 2 + roomCount,
    })
  }

  return (
    <div className="app">
      <main className="workspace">
        <div className="canvas-toolbar">
          <button onClick={handleAddRoom}>
            + Agregar habitación
          </button>
        </div>

        <FloorCanvas />
      </main>

      <aside className="properties-sidebar">
        <PropertiesPanel />
      </aside>
    </div>
  )
}

export default App
