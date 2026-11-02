import { useEffect, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"

import { useHouseStore } from "../../store/houseStore"
import type { Room } from "../../model/room"

import { Grid } from "./Grid"
import { RoomShape } from "./RoomShape"
import type { RoomEdge } from "./RoomShape"
import { GridSizeSelector } from "./GridSizeSelector"

import { snap } from "../../geometry/snapping"

const SCALE = 50
const MIN_SIZE = 0.5

export function FloorCanvas() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [cutting, setCutting] = useState(false)

  const house = useHouseStore((state) => state.house)
  const selectedRoomId = useHouseStore((state) => state.selectedRoomId)
  const gridSize = useHouseStore((state) => state.gridSize)
  const selectRoom = useHouseStore((state) => state.selectRoom)
  const moveRoom = useHouseStore((state) => state.moveRoom)
  const resizeRoom = useHouseStore((state) => state.resizeRoom)
  const splitRoomEdge = useHouseStore(
    (state) => state.splitRoomEdge
  )
  const moveRoomEdge = useHouseStore(
    (state) => state.moveRoomEdge
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCutting(false)
        setEditingRoomId(null)
      }
    }
  
    window.addEventListener("keydown", handleKeyDown)
  
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])
  
  useEffect(() => {
    if (
      editingRoomId !== null &&
      selectedRoomId !== editingRoomId
    ) {
      setEditingRoomId(null)
      setCutting(false)
    }
  }, [selectedRoomId, editingRoomId])

  function handlePointerDown(
    event: ReactPointerEvent,
    room: Room
  ) {
    event.stopPropagation()
    selectRoom(room.id)

    if (event.shiftKey) {
      setEditingRoomId(room.id)
      return
    }

    if (editingRoomId !== null) {
      return
    }

    const startX = event.clientX
    const startY = event.clientY

    const initialX = room.position.x
    const initialY = room.position.y

    function move(e: PointerEvent) {
      const dx = (e.clientX - startX) / SCALE
      const dy = (e.clientY - startY) / SCALE

      moveRoom(
        room.id,
        snap(initialX + dx, gridSize),
        snap(initialY + dy, gridSize)
      )
    }

    function up() {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  function handleEdgePointerDown(
    event: ReactPointerEvent,
    room: Room,
    edge: RoomEdge
  ) {
    event.stopPropagation()
    event.preventDefault()

    const startX = event.clientX
    const startY = event.clientY

    const originalX = room.position.x
    const originalY = room.position.y
    const originalWidth = room.width
    const originalHeight = room.height

    const minWidth = Math.max(room.minWidth ?? MIN_SIZE, gridSize)
    const minHeight = Math.max(room.minHeight ?? MIN_SIZE, gridSize)

    // Se trabaja en coordenadas locales de la habitación.
    const radians = (room.rotation * Math.PI) / 180
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)

    function move(e: PointerEvent) {
      const screenDx = (e.clientX - startX) / SCALE
      const screenDy = (e.clientY - startY) / SCALE

      const dx = screenDx * cos + screenDy * sin
      const dy = -screenDx * sin + screenDy * cos

      let x = originalX
      let y = originalY
      let width = originalWidth
      let height = originalHeight

      if (edge === "right") {
        width = Math.max(
          minWidth,
          snap(originalWidth + dx, gridSize)
        )
      }

      if (edge === "left") {
        const right = originalX + originalWidth

        width = Math.max(
          minWidth,
          snap(originalWidth - dx, gridSize)
        )

        x = right - width
      }

      if (edge === "bottom") {
        height = Math.max(
          minHeight,
          snap(originalHeight + dy, gridSize)
        )
      }

      if (edge === "top") {
        const bottom = originalY + originalHeight

        height = Math.max(
          minHeight,
          snap(originalHeight - dy, gridSize)
        )

        y = bottom - height
      }

      resizeRoom(room.id, x, y, width, height)
    }

    function up() {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  return (
    <div className="floor-canvas">
      {editingRoomId !== null && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 10,
            background: "white",
            padding: 8,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <button
            type="button"
            onClick={() => setCutting((value) => !value)}
            style={{
              padding: "8px 12px",
              background: cutting ? "#dc2626" : "#e2e8f0",
              color: cutting ? "white" : "#1e293b",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {cutting ? "Salir del corte" : "Cortar arista"}
          </button>
        </div>
      )}
      <svg
        ref={svgRef}
        width={house.width * SCALE}
        height={house.height * SCALE}
        viewBox={`0 0 ${house.width * SCALE} ${house.height * SCALE}`}
        style={{
          background: "#ffffff",
          touchAction: "none",
        }}
        onPointerDown={() => {
          selectRoom(null)
          setEditingRoomId(null)
        }}
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
            gridSize={gridSize}
            selected={room.id === selectedRoomId}
            editing={room.id === editingRoomId}
            cutting={cutting && room.id === editingRoomId}
            onPointerDown={handlePointerDown}
            onEdgePointerDown={handleEdgePointerDown}
            onSplitEdge={splitRoomEdge}
	    onMoveEdge={moveRoomEdge}
          />
        ))}
      </svg>

      <GridSizeSelector />
    </div>
  )
}
