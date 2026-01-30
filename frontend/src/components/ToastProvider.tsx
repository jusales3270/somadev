'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Toaster
                position="bottom-right"
                gutter={8}
                containerStyle={{
                    bottom: 24,
                    right: 24
                }}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#18181b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '14px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#18181b',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#18181b',
                        },
                    },
                    loading: {
                        iconTheme: {
                            primary: '#f97316',
                            secondary: '#18181b',
                        },
                    },
                }}
            />
        </>
    )
}
