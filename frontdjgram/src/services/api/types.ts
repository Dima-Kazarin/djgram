import { ReactNode } from "react"

export type Post = {
    id: number,
    image: string,
    description: string,
    created_at: ReactNode,
    author: number,
    like_count: string
}

export type User = {
    id: number,
    username: string,
    password: string
}