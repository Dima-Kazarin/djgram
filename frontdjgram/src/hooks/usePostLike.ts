import { useEffect, useState } from 'react'
import { useAddLikeMutation, useGetLikedPostsByUserQuery, useRemoveLikeMutation } from '../services/api/api'
import TokenStorage from '../services/api/JwtToken'

type UsePostLikeParams = {
  postId: number
  initialLikeCount: number
}

export const usePostLike = ({ postId, initialLikeCount }: UsePostLikeParams) => {
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: number | null }>({})
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [userId, setUserId] = useState<number | null>(null)
  const [socket, setSocket] = useState<{ [key: number]: WebSocket }>({})
  const { data: likedPostsData, refetch: refetchLikedPosts } = useGetLikedPostsByUserQuery(userId ?? 0, { skip: userId === null })

  useEffect(() => {
    if (likedPostsData) {
      const likedMap = likedPostsData.reduce<{ [key: number]: number | null }>((acc, { post, id }) => {
        acc[post] = id
        return acc
      }, {})
      setLikedPosts(likedMap)
    }
  }, [likedPostsData])

  const [addLike] = useAddLikeMutation()
  const [removeLike] = useRemoveLikeMutation()

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await TokenStorage.getUserId()
      setUserId(id)
    }
    fetchUserId()
  }, [])

  useEffect(() => {
    const ws = new WebSocket(`ws://192.168.1.4:8000/ws/likes/${postId}`)

    ws.onopen = () => {
      console.log(`Websocket for ${postId} open`)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.post_id === postId) {
        setLikeCount(data.like_count)
      }
    }

    setSocket((prevState: any) => ({
      ...prevState,
      [postId]: ws
    }))
    return () => ws.close()
  }, [postId])

  const toggleLike = async () => {
    if (!userId) return
    const likeId = likedPosts[postId]

    try {
      if (likeId) {
        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: null,
        }))
        await removeLike(likeId).unwrap()
        socket[postId]?.send(JSON.stringify({ type: 'like_removed', post_id: postId, like_count: likeCount - 1 }))
      } else {
        const response = await addLike({ post: postId }).unwrap()
        setLikedPosts((prevState) => ({
          ...prevState,
          [postId]: response.id,
        }))
        socket[postId]?.send(JSON.stringify({ type: 'like_added', post_id: postId, like_count: likeCount + 1 }))
      }
    } catch (err) {
      console.error("Like error:", err)
    }
  }

  return { likeCount, likedPosts, toggleLike, refetchLikedPosts, socket }
}
