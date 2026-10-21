import type { Room } from "../../model/room"

interface Props {
  room: Room
  scale: number
  selected: boolean

  onPointerDown: (
    event: React.PointerEvent,
    room: Room
  ) => void
}

export function RoomShape({
  room,
  scale,
  selected,
  onPointerDown,
}: Props) {
  const x = room.position.x * scale
  const y = room.position.y * scale

  return (
    <g
      transform={`
        translate(${x} ${y})
        rotate(${room.rotation} ${
          (room.width * scale) / 2
        } ${(room.height * scale) / 2})
      `}
      onPointerDown={(event) =>
        onPointerDown(event, room)
      }
      style={{
        cursor: "grab",
      }}
    >
      <rect
        width={room.width * scale}
        height={room.height * scale}
        fill={selected ? "#dbeafe" : "#f8fafc"}
        stroke={selected ? "#2563eb" : "#334155"}
        strokeWidth={selected ? 3 : 2}
      />

      <text
        x={(room.width * scale) / 2}
        y={(room.height * scale) / 2}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {room.name}
      </text>
    </g>
  )
}
