"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Task {
    id: number
    title: string
    status: string
    agent: string
}

export function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const columns = ["To Do", "In Progress", "Done"]

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch('http://localhost:8000/tasks')
                if (res.ok) {
                    const data = await res.json()
                    setTasks(data)
                }
            } catch (e) {
                console.error("Failed to fetch tasks")
            }
        }

        fetchTasks()
        const interval = setInterval(fetchTasks, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {columns.map((col) => (
                <div key={col} className={`rounded-xl p-4 bg-slate-900/40 border border-slate-800 flex flex-col gap-3 min-h-[300px]`}>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-slate-300">{col}</h3>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                            {tasks.filter(t => t.status === col).length}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {tasks.filter(t => t.status === col).map(task => (
                            <Card key={task.id} className="bg-slate-950 border-slate-800 hover:border-slate-600 transition-colors cursor-pointer">
                                <CardHeader className="p-3 pb-0">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-mono text-slate-500">TASK-{task.id}</span>
                                        <Badge variant="outline" className="text-[10px] h-5 border-slate-700 text-slate-400">
                                            {task.agent}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-2">
                                    <p className="text-sm font-medium text-slate-200">{task.title}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
