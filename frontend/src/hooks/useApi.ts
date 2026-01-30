'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface RetryOptions {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    backoffMultiplier?: number
}

const DEFAULT_OPTIONS: RetryOptions = {
    maxRetries: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2
}

async function fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = DEFAULT_OPTIONS
): Promise<T> {
    const { maxRetries, initialDelay, maxDelay, backoffMultiplier } = { ...DEFAULT_OPTIONS, ...retryOptions }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries!; attempt++) {
        try {
            const response = await fetch(url, options)

            // Rate limit handling
            if (response.status === 429) {
                const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10)
                toast.warning(`Rate limited. Retrying in ${retryAfter}s...`)
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
                continue
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            lastError = error as Error

            // Check if it's a network error (worth retrying)
            const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch'
            const isServerError = lastError.message.startsWith('HTTP 5')

            if ((isNetworkError || isServerError) && attempt < maxRetries!) {
                const delay = Math.min(initialDelay! * Math.pow(backoffMultiplier!, attempt), maxDelay!)
                console.log(`Retry ${attempt + 1}/${maxRetries} in ${delay}ms...`)
                await new Promise(resolve => setTimeout(resolve, delay))
            } else {
                throw error
            }
        }
    }

    throw lastError
}

interface UseApiOptions {
    baseUrl?: string
    apiKey?: string
    autoRetry?: boolean
}

export function useApi(options: UseApiOptions = {}) {
    const {
        baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        apiKey = process.env.NEXT_PUBLIC_API_KEY || '',
        autoRetry = true
    } = options

    const getHeaders = useCallback(() => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        }
        if (apiKey) {
            headers['x-api-key'] = apiKey
        }
        return headers
    }, [apiKey])

    const get = useCallback(async <T>(endpoint: string): Promise<T> => {
        const url = `${baseUrl}${endpoint}`
        if (autoRetry) {
            return fetchWithRetry<T>(url, { headers: getHeaders() })
        }
        const res = await fetch(url, { headers: getHeaders() })
        return res.json()
    }, [baseUrl, getHeaders, autoRetry])

    const post = useCallback(async <T>(endpoint: string, data?: any): Promise<T> => {
        const url = `${baseUrl}${endpoint}`
        const options: RequestInit = {
            method: 'POST',
            headers: getHeaders(),
            body: data ? JSON.stringify(data) : undefined
        }
        if (autoRetry) {
            return fetchWithRetry<T>(url, options)
        }
        const res = await fetch(url, options)
        return res.json()
    }, [baseUrl, getHeaders, autoRetry])

    const patch = useCallback(async <T>(endpoint: string, data?: any): Promise<T> => {
        const url = `${baseUrl}${endpoint}`
        const options: RequestInit = {
            method: 'PATCH',
            headers: getHeaders(),
            body: data ? JSON.stringify(data) : undefined
        }
        const res = await fetch(url, options)
        return res.json()
    }, [baseUrl, getHeaders])

    const del = useCallback(async <T>(endpoint: string): Promise<T> => {
        const url = `${baseUrl}${endpoint}`
        const res = await fetch(url, { method: 'DELETE', headers: getHeaders() })
        return res.json()
    }, [baseUrl, getHeaders])

    return { get, post, patch, del }
}

// Hook for task operations
export function useTasks() {
    const api = useApi()
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchTasks = useCallback(async () => {
        try {
            setError(null)
            const data = await api.get<any[]>('/tasks')
            setTasks(data)
        } catch (err) {
            setError(err as Error)
            toast.error('Failed to fetch tasks')
        } finally {
            setLoading(false)
        }
    }, [api])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const executeTask = useCallback(async (taskId: number) => {
        try {
            await api.post(`/execute/${taskId}`)
            toast.success(`Task ${taskId} started`)
            await fetchTasks()
        } catch (err) {
            toast.error('Failed to execute task')
        }
    }, [api, fetchTasks])

    const updateTask = useCallback(async (taskId: number, data: { title?: string; description?: string }) => {
        try {
            await api.patch(`/tasks/${taskId}`, data)
            toast.success('Task updated')
            await fetchTasks()
        } catch (err) {
            toast.error('Failed to update task')
        }
    }, [api, fetchTasks])

    const reorderTask = useCallback(async (taskId: number, status: string, orderIndex: number) => {
        try {
            await api.patch(`/tasks/${taskId}/reorder`, { status, order_index: orderIndex })
            await fetchTasks()
        } catch (err) {
            toast.error('Failed to move task')
        }
    }, [api, fetchTasks])

    const deleteTask = useCallback(async (taskId: number) => {
        try {
            await api.del(`/tasks/${taskId}`)
            toast.success('Task deleted')
            await fetchTasks()
        } catch (err) {
            toast.error('Failed to delete task')
        }
    }, [api, fetchTasks])

    return {
        tasks,
        loading,
        error,
        fetchTasks,
        executeTask,
        updateTask,
        reorderTask,
        deleteTask
    }
}
