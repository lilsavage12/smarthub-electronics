/**
 * @deprecated THIS FILE IS ARCHIVED AND NOT IN USE AS PER USER REQUEST.
 * User Dashboard and related synchronization functionality have been detached.
 * Relocated from original path for easy restoration.
 */
"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SyncStore {
    lastSyncTimestamp: number
    syncInProgress: boolean
    setLastSync: (timestamp: number) => void
    setSyncProgress: (inProgress: boolean) => void
}

export const useSyncStore = create<SyncStore>()(
    persist(
        (set) => ({
            lastSyncTimestamp: Date.now(),
            syncInProgress: false,
            setLastSync: (timestamp) => set({ lastSyncTimestamp: timestamp }),
            setSyncProgress: (inProgress) => set({ syncInProgress: inProgress }),
        }),
        { name: 'smarthub-sync-meta' }
    )
)

