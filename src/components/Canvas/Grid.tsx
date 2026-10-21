interface GridProps {
  width: number
  height: number
  scale: number
  gridSize: number
}

export function Grid({
  width,
  height,
  scale,
  gridSize,
}: GridProps) {
  const lines = []

  const columns = Math.floor(
    width / gridSize
  )

  const rows = Math.floor(
    height / gridSize
  )

  for (let i = 0; i <= columns; i++) {
    const x = i * gridSize * scale

    lines.push(
      <line
        key={`x-${i}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height * scale}
        stroke="#e2e8f0"
        strokeWidth={1}
      />
    )
  }

  for (let i = 0; i <= rows; i++) {
    const y = i * gridSize * scale

    lines.push(
      <line
        key={`y-${i}`}
        x1={0}
        y1={y}
        x2={width * scale}
        y2={y}
        stroke="#e2e8f0"
        strokeWidth={1}
      />
    )
  }

  return <g>{lines}</g>
}
