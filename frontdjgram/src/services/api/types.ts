import { ReactNode } from "react"

export type Post = {
    id: number,
    image: string,
    description: string,
    created_at: ReactNode,
    author: number,
    like_count: number
}

export type User = {
    id: number,
    username: string,
    password: string,
    icon: string
}

export type Like = {
    id: number,
    created_at: ReactNode,
    post: number,
    user: number
}

export type Chat = {
    id: number,
    name: string,
    member: [
        number
    ]
}

export type Message = {
    id: number,
    content: string,
    created_at: ReactNode,
    sender: number,
    chat: number
}

export type Follow = {
    id: number,
    created_at: ReactNode,
    follower: number,
    followed: number
}