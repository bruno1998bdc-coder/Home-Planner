import { create } from "zustand"

import type { House } from "../model/house"
import type { Room, RoomType } from "../model/room"

interface HouseState {
  house: House

  selectedRoomId: string | null
  
  gridSize: number

  setGridSize: (size: number) => void

  addRoom: (
    type: RoomType,
    position?: { x: number; y: number }
  ) => void

  moveRoom: (
    id: string,
    x: number,
    y: number
  ) => void

  resizeRoom: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => void

  updateRoom: (
    id: string,
    changes: Partial<Room>
  ) => void

  splitRoomEdge: (
    roomId: string,
    edgeIndex: number,
    x: number,
    y: number
  ) => void

  moveRoomEdge: (
    roomId: string,
    edgeIndex: number,
    delta: number
  ) => void

  rotateRoom: (id: string) => void

  selectRoom: (id: string | null) => void

  deleteRoom: (id: string) => void
}

const ROOM_COLORS = [
  "#bfdbfe", // Azul
  "#bbf7d0", // Verde
  "#fde68a", // Amarillo
  "#fecaca", // Rojo
  "#ddd6fe", // Violeta
  "#fed7aa", // Naranja
  "#a5f3fc", // Celeste
]

const initialHouse: House = {
  width: 20,
  height: 15,
  rooms: [],
}

export const useHouseStore = create<HouseState>((set) => ({
  house: initialHouse,

  selectedRoomId: null,
  
  gridSize: 0.25,

  setGridSize: (size) => {
    set({
      gridSize: size,
    })
  },

  addRoom: (type, position = { x: 2, y: 2 }) => {
    const id = crypto.randomUUID()
  
    set((state) => {
      const color = ROOM_COLORS[
        state.house.rooms.length % ROOM_COLORS.length
      ]
  
      const room: Room = {
        id,
        name: type,
        type,
        position,
        width: 3,
        height: 3,
        rotation: 0,
        color,
      }
  
      return {
        house: {
          ...state.house,
          rooms: [...state.house.rooms, room],
        },
        selectedRoomId: id,
      }
    })
  },

  moveRoom: (id, x, y) => {
    set((state) => ({
      house: {
        ...state.house,

        rooms: state.house.rooms.map((room) =>
          room.id === id
            ? {
                ...room,
                position: { x, y },
              }
            : room
        ),
      },
    }))
  },

  resizeRoom: (id, x, y, width, height) => {
    set((state) => ({
      house: {
        ...state.house,
        rooms: state.house.rooms.map((room) =>
          room.id === id
            ? {
                ...room,
                position: { x, y },
                width,
                height,
              }
            : room
        ),
      },
    }))
  },

  updateRoom: (id, changes) => {
    set((state) => ({
      house: {
        ...state.house,
        rooms: state.house.rooms.map((room) =>
          room.id === id
            ? {
                ...room,
                ...changes,
              }
            : room
        ),
      },
    }))
  },

  splitRoomEdge: (roomId, edgeIndex, x, y) => {
    set((state) => ({
      house: {
        ...state.house,

        rooms: state.house.rooms.map((room) => {
          if (room.id !== roomId) return room

          const vertices = room.vertices ?? [
            { id: crypto.randomUUID(), x: 0, y: 0 },
            { id: crypto.randomUUID(), x: room.width, y: 0 },
            { id: crypto.randomUUID(), x: room.width, y: room.height },
            { id: crypto.randomUUID(), x: 0, y: room.height },
          ]

          if (edgeIndex < 0 || edgeIndex >= vertices.length) {
            return room
          }

          const start = vertices[edgeIndex]
          const end = vertices[(edgeIndex + 1) % vertices.length]

          // Ajustar el punto de corte a la cuadrícula
          const grid = state.gridSize

          const cutX = Math.round(x / grid) * grid
          const cutY = Math.round(y / grid) * grid

          // Comprobar que el punto esté dentro de la arista
          const dx = end.x - start.x
          const dy = end.y - start.y

          const lengthSquared = dx * dx + dy * dy

          if (lengthSquared === 0) return room

          const t =
            ((cutX - start.x) * dx + (cutY - start.y) * dy) /
            lengthSquared

          // No permitir cortes en los extremos
          if (t <= 0 || t >= 1) return room

          // Comprobar que el punto pertenezca a la arista
          const projectedX = start.x + t * dx
          const projectedY = start.y + t * dy

          if (
            Math.abs(projectedX - cutX) > 0.000001 ||
            Math.abs(projectedY - cutY) > 0.000001
          ) {
            return room
          }

          const newVertex = {
            id: crypto.randomUUID(),
            x: cutX,
            y: cutY,
	    createdByCut: true,
          }

          const updatedVertices = [...vertices]

          updatedVertices.splice(edgeIndex + 1, 0, newVertex)

          return {
            ...room,
            vertices: updatedVertices,
          }
        }),
      },
    }))
  },

  moveRoomEdge: (roomId, edgeIndex, delta) => {
    set((state) => ({
      house: {
        ...state.house,

        rooms: state.house.rooms.map((room) => {
          if (room.id !== roomId) return room

          const vertices = room.vertices ?? [
            { id: crypto.randomUUID(), x: 0, y: 0 },
            { id: crypto.randomUUID(), x: room.width, y: 0 },
            { id: crypto.randomUUID(), x: room.width, y: room.height },
            { id: crypto.randomUUID(), x: 0, y: room.height },
          ]

          if (edgeIndex < 0 || edgeIndex >= vertices.length) {
            return room
          }

          const nextIndex = (edgeIndex + 1) % vertices.length

          const start = vertices[edgeIndex]
          const end = vertices[nextIndex]

          const horizontal = Math.abs(start.y - end.y) < 0.000001
          const vertical = Math.abs(start.x - end.x) < 0.000001

          // Por ahora solo desplazamos paredes ortogonales.
          if (!horizontal && !vertical) return room

          const offset =
            Math.round(delta / state.gridSize) * state.gridSize

          const updatedVertices = vertices.map((vertex, index) => {
            if (index !== edgeIndex && index !== nextIndex) {
              return vertex
            }

            return horizontal
              ? { ...vertex, y: vertex.y + offset }
              : { ...vertex, x: vertex.x + offset }
          })

          return {
            ...room,
            vertices: updatedVertices,
          }
        }),
      },
    }))
  },

  rotateRoom: (id) => {
    set((state) => ({
      house: {
        ...state.house,

        rooms: state.house.rooms.map((room) =>
          room.id === id
            ? {
                ...room,
                rotation: (room.rotation + 90) % 360,
              }
            : room
        ),
      },
    }))
  },

  selectRoom: (id) => {
    set({
      selectedRoomId: id,
    })
  },

  deleteRoom: (id) => {
    set((state) => ({
      house: {
        ...state.house,

        rooms: state.house.rooms.filter(
          (room) => room.id !== id
        ),
      },

      selectedRoomId:
        state.selectedRoomId === id
          ? null
          : state.selectedRoomId,
    }))
  },
}))
