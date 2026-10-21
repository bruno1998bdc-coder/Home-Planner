import { useHouseStore } from "../../store/houseStore"

const rooms = [
  ["bedroom", "Dormitorio"],
  ["bathroom", "Baño"],
  ["kitchen", "Cocina"],
  ["living", "Living"],
  ["dining", "Comedor"],
  ["garage", "Garaje"],
  ["hall", "Pasillo"],
] as const

export function RoomPalette() {
  const addRoom = useHouseStore(
    (state) => state.addRoom
  )

  return (
    <aside>
      <h2>Habitaciones</h2>

      {rooms.map(([type, name]) => (
        <button
          key={type}
          onClick={() => addRoom(type)}
        >
          + {name}
        </button>
      ))}
    </aside>
  )
}
