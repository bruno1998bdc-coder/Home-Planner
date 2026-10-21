import { useRef } from "react"

import { useHouseStore } from "../../store/houseStore"

import { Grid } from "./Grid"
import { RoomShape } from "./RoomShape"
import { GridSizeSelector } from "./GridSizeSelector"

import { snap } from "../../geometry/snapping"

const SCALE = 50

export function FloorCanvas() {
  const svgRef = useRef<SVGSVGElement>(null)

  const house = useHouseStore(
    (state) => state.house
  )

  const selectedRoomId = useHouseStore(
    (state) => state.selectedRoomId
  )

  const gridSize = useHouseStore(
    (state) => state.gridSize
  )

  const selectRoom = useHouseStore(
    (state) => state.selectRoom
  )

  const moveRoom = useHouseStore(
    (state) => state.moveRoom
  )

  function handlePointerDown(
    event: React.PointerEvent,
    room: typeof house.rooms[number]
  ) {
    event.stopPropagation()

    selectRoom(room.id)

    const startX = event.clientX
    const startY = event.clientY

    const initialX = room.position.x
    const initialY = room.position.y

    function move(e: PointerEvent) {
      const dx =
        (e.clientX - startX) / SCALE

      const dy =
        (e.clientY - startY) / SCALE

      const newX = snap(
        initialX + dx,
        gridSize
      )

      const newY = snap(
        initialY + dy,
        gridSize
      )

      moveRoom(
        room.id,
        newX,
        newY
      )
    }

    function up() {
      window.removeEventListener(
        "pointermove",
        move
      )

      window.removeEventListener(
        "pointerup",
        up
      )
    }

    window.addEventListener(
      "pointermove",
      move
    )

    window.addEventListener(
      "pointerup",
      up
    )
  }

  return (
    <div className="floor-canvas">
      <svg
        ref={svgRef}
        width={house.width * SCALE}
        height={house.height * SCALE}
        viewBox={`
          0
          0
          ${house.width * SCALE}
          ${house.height * SCALE}
        `}
        style={{
          background: "#ffffff",
          touchAction: "none",
        }}
        onPointerDown={() =>
          selectRoom(null)
        }
      >
        <Grid
          width={house.width}
          height={house.height}
          scale={SCALE}
          gridSize={gridSize}
        />

        {house.rooms.map((room) => (
          <RoomShape
            key={room.id}
            room={room}
            scale={SCALE}
            selected={
              room.id === selectedRoomId
            }
            onPointerDown={handlePointerDown}
          />
        ))}
      </svg>

      <GridSizeSelector />
    </div>
  )
}
