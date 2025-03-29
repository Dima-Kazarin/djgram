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

export type Like = {
    id: number,
    created_at: ReactNode,
    post: number,
    user: number
}