import { useHouseStore } from "../../store/houseStore"

const GRID_OPTIONS = [
  0.10,
  0.25,
  0.50,
  1.00,
]

export function GridSizeSelector() {
  const gridSize = useHouseStore(
    (state) => state.gridSize
  )

  const setGridSize = useHouseStore(
    (state) => state.setGridSize
  )

  return (
    <div className="grid-size-selector">
      <label htmlFor="grid-size">
        Cuadrícula
      </label>

      <select
        id="grid-size"
        value={gridSize}
        onChange={(event) =>
          setGridSize(
            Number(event.target.value)
          )
        }
      >
        {GRID_OPTIONS.map((size) => (
          <option
            key={size}
            value={size}
          >
            {size.toFixed(2)} m
          </option>
        ))}
      </select>
    </div>
  )
}
