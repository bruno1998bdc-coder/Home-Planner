export type Point = {
  x: number
  y: number
}

export type Vertex = {
  id: string
  x: number
  y: number
  createdByCut?: boolean
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

  color: string

  vertices?: Vertex[]

  minWidth?: number
  minHeight?: number
}
