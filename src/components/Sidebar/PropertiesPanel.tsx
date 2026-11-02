import { useHouseStore } from "../../store/houseStore"
import type { RoomType } from "../../model/room"
import { snap } from "../../geometry/snapping"

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "bedroom", label: "Dormitorio" },
  { value: "bathroom", label: "Baño" },
  { value: "kitchen", label: "Cocina" },
  { value: "living", label: "Living" },
  { value: "dining", label: "Comedor" },
  { value: "garage", label: "Garaje" },
  { value: "hall", label: "Pasillo" },
]

export function PropertiesPanel() {
  const house = useHouseStore((state) => state.house)
  const selectedRoomId = useHouseStore((state) => state.selectedRoomId)
  const gridSize = useHouseStore((state) => state.gridSize)
  const updateRoom = useHouseStore((state) => state.updateRoom)
  const resizeRoom = useHouseStore((state) => state.resizeRoom)
  const deleteRoom = useHouseStore((state) => state.deleteRoom)

  const room = house.rooms.find((r) => r.id === selectedRoomId)

  if (!room) {
    return (
      <div className="properties-panel">
        <h3>Propiedades</h3>
        <p>Seleccioná una habitación para editarla.</p>
      </div>
    )
  }

  function changeSize(axis: "width" | "height", value: number) {
    if (!Number.isFinite(value) || value <= 0) return

    const size = Math.max(gridSize, snap(value, gridSize))

    resizeRoom(
      room!.id,
      room!.position.x,
      room!.position.y,
      axis === "width" ? size : room!.width,
      axis === "height" ? size : room!.height
    )
  }

  return (
    <div className="properties-panel">
      <h3>Propiedades</h3>

      <label>Nombre</label>
      <input
        type="text"
        value={room.name}
        onChange={(e) =>
          updateRoom(room.id, { name: e.target.value })
        }
      />

      <label>Tipo</label>
      <select
        value={room.type}
        onChange={(e) =>
          updateRoom(room.id, {
            type: e.target.value as RoomType,
          })
        }
      >
        {ROOM_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      
      <label>Color</label>
      <input
        type="color"
        value={room.color ?? "#dbeafe"}
        onChange={(e) =>
          updateRoom(room.id, {
            color: e.target.value,
          })
        }
      />

      <div className="property-dimensions">
        <div>
          <label>Ancho (m)</label>
          <input
            type="number"
            min={gridSize}
            step={gridSize}
            key={`${room.id}-width`}
            defaultValue={room.width}
            onBlur={(e) => changeSize("width", Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur()
            }}
          />
        </div>

        <div>
          <label>Alto (m)</label>
          <input
            type="number"
            min={gridSize}
            step={gridSize}
            key={`${room.id}-height`}
            defaultValue={room.height}
            onBlur={(e) => changeSize("height", Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur()
            }}
          />
        </div>
      </div>

      <p>
        <strong>Superficie:</strong>{" "}
        {(room.width * room.height).toFixed(2)} m²
      </p>

      <button
        className="delete-room"
        onClick={() => deleteRoom(room.id)}
      >
        Eliminar habitación
      </button>
    </div>
  )
}
