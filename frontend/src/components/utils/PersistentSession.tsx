import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import useRefreshToken from '@/hooks/useRefreshToken'
import useAuth from '@/hooks/useAuth'

function PersistentSession() {

    const [isLoading, setIsLoading] = useState(true)
    const refresh = useRefreshToken()
    const { auth } = useAuth()

    useEffect(() => {
        const verifyRefreshToken = async () => {
            try {
                await refresh()
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        !auth?.data?.user?.id ? verifyRefreshToken() : setIsLoading(false)
    }, [])

    return (
        <>
            {!isLoading ? <Outlet /> : <p>Loading...</p>}
        </>
    )
}

export default PersistentSession