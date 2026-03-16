"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (url: string) => Promise<void>
}

export function AudioLinkModal({ open, onOpenChange, onSubmit }: Props) {

    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!url) return

        setLoading(true)
        await onSubmit(url)
        setLoading(false)
        setUrl("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>

                <DialogHeader>
                    <DialogTitle>Add Audio From YouTube</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <Input
                        placeholder="Paste YouTube link"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !url}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}