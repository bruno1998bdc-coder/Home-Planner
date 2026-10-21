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

  rotateRoom: (id: string) => void

  selectRoom: (id: string | null) => void

  deleteRoom: (id: string) => void
}

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

    const room: Room = {
      id,

      name: type,
      type,

      position,

      width: 3,
      height: 3,

      rotation: 0,
    }

    set((state) => ({
      house: {
        ...state.house,
        rooms: [...state.house.rooms, room],
      },

      selectedRoomId: id,
    }))
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
