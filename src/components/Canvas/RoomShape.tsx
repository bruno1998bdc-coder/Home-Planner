import { useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import type { Room } from "../../model/room"

export type RoomEdge = "left" | "right" | "top" | "bottom"

interface Props {
  room: Room
  scale: number
  gridSize: number
  selected: boolean
  editing: boolean
  cutting: boolean

  onPointerDown: (
    event: ReactPointerEvent,
    room: Room
  ) => void

  onEdgePointerDown: (
    event: ReactPointerEvent,
    room: Room,
    edge: RoomEdge
  ) => void

  onSplitEdge: (
    roomId: string,
    edgeIndex: number,
    x: number,
    y: number
  ) => void

  onMoveEdge: (
    roomId: string,
    edgeIndex: number,
    delta: number
  ) => void
}

export function RoomShape({
  room,
  scale,
  gridSize,
  selected,
  editing,
  cutting,
  onPointerDown,
  onEdgePointerDown,
  onSplitEdge,
  onMoveEdge,
}: Props) {
  const [cutPreview, setCutPreview] = useState<{
    x: number
    y: number
    edgeIndex: number
  } | null>(null)

  const x = room.position.x * scale
  const y = room.position.y * scale

  const width = room.width * scale
  const height = room.height * scale

  // Coordenadas locales, expresadas en metros.
  const vertices = room.vertices ?? [
    { id: "top-left", x: 0, y: 0 },
    { id: "top-right", x: room.width, y: 0 },
    { id: "bottom-right", x: room.width, y: room.height },
    { id: "bottom-left", x: 0, y: room.height },
  ]

  function handleSegmentPointerDown(
    event: ReactPointerEvent<SVGLineElement>,
    edgeIndex: number
  ) {
    event.stopPropagation()
    event.preventDefault()

    const start = vertices[edgeIndex]
    const end = vertices[(edgeIndex + 1) % vertices.length]

    const horizontal = Math.abs(start.y - end.y) < 0.000001
    const vertical = Math.abs(start.x - end.x) < 0.000001

    if (!horizontal && !vertical) return

    const startX = event.clientX
    const startY = event.clientY

    const radians = (room.rotation * Math.PI) / 180
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)

    let previousOffset = 0

    function move(e: PointerEvent) {
      const screenDx = (e.clientX - startX) / scale
      const screenDy = (e.clientY - startY) / scale

      // Convertir el movimiento a coordenadas locales.
      const localDx = screenDx * cos + screenDy * sin
      const localDy = -screenDx * sin + screenDy * cos

      const displacement = horizontal ? localDy : localDx

      const snappedOffset =
        Math.round(displacement / gridSize) * gridSize

      const incrementalOffset = snappedOffset - previousOffset

      if (incrementalOffset === 0) return

      onMoveEdge(room.id, edgeIndex, incrementalOffset)

      previousOffset = snappedOffset
    }

    function up() {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  const points = vertices
    .map((vertex) => `${vertex.x * scale},${vertex.y * scale}`)
    .join(" ")

  function getCutPosition(
    event: ReactPointerEvent<SVGLineElement>,
    edgeIndex: number
  ) {
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return null

    const matrix = event.currentTarget.getScreenCTM()
    if (!matrix) return null

    const point = svg.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY

    const local = point.matrixTransform(matrix.inverse())

    const start = vertices[edgeIndex]
    const end = vertices[(edgeIndex + 1) % vertices.length]

    const dx = end.x - start.x
    const dy = end.y - start.y

    const lengthSquared = dx * dx + dy * dy
    if (lengthSquared === 0) return null

    // Proyectar el cursor sobre la arista.
    const t = Math.max(
      0,
      Math.min(
        1,
        ((local.x / scale - start.x) * dx +
          (local.y / scale - start.y) * dy) /
          lengthSquared
      )
    )

    const projectedX = start.x + t * dx
    const projectedY = start.y + t * dy

    // Ajustar a la cuadrícula.
    const cutX =
      Math.round(projectedX / gridSize) * gridSize

    const cutY =
      Math.round(projectedY / gridSize) * gridSize

    // Evitar cortes en los extremos.
    if (
      (Math.abs(cutX - start.x) < 0.000001 &&
        Math.abs(cutY - start.y) < 0.000001) ||
      (Math.abs(cutX - end.x) < 0.000001 &&
        Math.abs(cutY - end.y) < 0.000001)
    ) {
      return null
    }

    // Confirmar que el punto ajustado siga sobre la arista.
    const cross =
      (cutX - start.x) * dy -
      (cutY - start.y) * dx

    if (Math.abs(cross) > 0.000001) return null

    return { x: cutX, y: cutY, edgeIndex }
  }

  return (
    <g
      transform={`
        translate(${x} ${y})
        rotate(${room.rotation} ${width / 2} ${height / 2})
      `}
      onPointerDown={(event) => {
        event.stopPropagation()
        if (!cutting) onPointerDown(event, room)
      }}
      style={{
        cursor: cutting ? "crosshair" : editing ? "default" : "grab",
      }}
    >
      <polygon
        points={points}
        fill={room.color ?? "#dbeafe"}
        stroke={
          editing
            ? "#ea580c"
            : selected
              ? "#2563eb"
              : "#334155"
        }
        strokeWidth={editing ? 4 : selected ? 3 : 2}
        strokeDasharray={editing ? "10 5" : undefined}
      />

      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        pointerEvents="none"
      >
        {room.name}
      </text>

      {editing &&
        vertices.map((start, index) => {
          const end = vertices[(index + 1) % vertices.length]

          const isHorizontal =
            Math.abs(start.y - end.y) < 0.000001

          const edge: RoomEdge = isHorizontal
            ? start.y === 0
              ? "top"
              : "bottom"
            : start.x === 0
              ? "left"
              : "right"

          return (
            <line
              key={`${start.id}-${end.id}`}
              x1={start.x * scale}
              y1={start.y * scale}
              x2={end.x * scale}
              y2={end.y * scale}
              stroke="transparent"
              strokeWidth={14}
              style={{
                cursor: cutting
                  ? "crosshair"
                  : isHorizontal
                    ? "ns-resize"
                    : "ew-resize",
                pointerEvents: "stroke",
              }}
              onPointerMove={(event) => {
                if (!cutting) return

                setCutPreview(getCutPosition(event, index))
              }}
              onPointerLeave={() => {
                setCutPreview(null)
              }}
              onPointerDown={(event) => {
                event.stopPropagation()
                event.preventDefault()

                if (cutting) {
                  const position = getCutPosition(event, index)

                  if (position) {
                    onSplitEdge(
                      room.id,
                      position.edgeIndex,
                      position.x,
                      position.y
                    )
                  }

                  setCutPreview(null)
                  return
                }

                // Conservamos el redimensionamiento de los
                // rectángulos que todavía no fueron cortados.
		if (room.vertices) {
                  handleSegmentPointerDown(event, index)
                } else {
                  onEdgePointerDown(event, room, edge)
                }
              }}
            />
          )
        })}
      
	{editing &&
          vertices.map((vertex) => (
            <circle
              key={vertex.id}
              cx={vertex.x * scale}
              cy={vertex.y * scale}
              r={5}
              fill={vertex.createdByCut ? "#f97316" : "#2563eb"}
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          ))}

      {editing && cutting && cutPreview && (
        <circle
          cx={cutPreview.x * scale}
          cy={cutPreview.y * scale}
          r={6}
          fill="#dc2626"
          stroke="white"
          strokeWidth={2}
          pointerEvents="none"
        />
      )}
    </g>
  )
}
