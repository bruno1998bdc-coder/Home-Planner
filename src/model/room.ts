export type Point = {
  x: number
  y: number
}

export type RoomType =
  | "bedroom"
  | "bathroom"
  | "kitchen"
  | "living"
  | "dining"
  | "garage"
  | "hall"

export interface Room {
  id: string
  name: string
  type: RoomType

  position: Point

  width: number
  height: number

  rotation: number

  minWidth?: number
  minHeight?: number
}
