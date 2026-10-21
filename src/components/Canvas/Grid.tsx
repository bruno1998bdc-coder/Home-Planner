interface GridProps {
  width: number
  height: number
  scale: number
}

export function Grid({
  width,
  height,
  scale,
}: GridProps) {
  const lines = []

  for (let x = 0; x <= width; x++) {
    lines.push(
      <line
        key={`x-${x}`}
        x1={x * scale}
        y1={0}
        x2={x * scale}
        y2={height * scale}
        stroke="#ddd"
      />
    )
  }

  for (let y = 0; y <= height; y++) {
    lines.push(
      <line
        key={`y-${y}`}
        x1={0}
        y1={y * scale}
        x2={width * scale}
        y2={y * scale}
        stroke="#ddd"
      />
    )
  }

  return <g>{lines}</g>
}
