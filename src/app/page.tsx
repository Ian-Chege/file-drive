"use client"

import { useQuery } from "convex/react"
import { useOrganization, useUser } from "@clerk/nextjs"
import Image from "next/image"
import { Loader2 } from "lucide-react"

import { api } from "../../convex/_generated/api"
import { UploadButton } from "@/components/dashboard/upload-button"
import { FileCard } from "@/components/dashboard/file-card"

export default function Home() {
  const organization = useOrganization()
  const user = useUser()
  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id
  }
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip")
  const isLoading = files === undefined

  return (
    <main className="container mx-auto p-12">
      {isLoading && (
        <div className="flex flex-col gap-8 w-full items-center mt-24">
          <Loader2 className="h-24 w-24 animate-spin text-gray-500" />
          <div className="text-2xl">Loading...</div>
        </div>
      )}
      {!isLoading && files.length === 0 && (
        <div className="flex flex-col gap-8 w-full items-center mt-24">
          <Image
            src="/empty-state.svg"
            alt="empty-state"
            width={500}
            height={500}
          />
          <p className="text-2xl">
            You have no files, go ahead and upload one.
          </p>
          <UploadButton />
        </div>
      )}

      {!isLoading && files.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your files</h1>
            <UploadButton />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {files?.map((file) => {
              return <FileCard key={file._id} file={file} />
            })}
          </div>
        </>
      )}
    </main>
  )
}
