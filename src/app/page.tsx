"use client"

import { useMutation } from "convex/react"
import { useQuery } from "convex/react"
import { useOrganization, useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { set, useForm } from "react-hook-form"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { api } from "../../convex/_generated/api"

import { z } from "zod"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  title: z.string().min(1).max(50),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, `Required`),
})

export default function Home() {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
  const organization = useOrganization()
  const user = useUser()
  const { toast } = useToast()
  let orgId: string | undefined = undefined
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  })

  const fileRef = form.register("file")

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgId) return
    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl()
    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0].type },
      body: values.file[0],
    })
    const { storageId } = await result.json()
    try {
      await createFile({ name: values.title, fileId: storageId, orgId })
      form.reset()
      setIsFileDialogOpen(false)
      toast({
        variant: "success",
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while uploading your file.",
      })
      return
    }
  }

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip")
  const createFile = useMutation(api.files.createFile)
  return (
    <main className="container mx-auto p-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your files</h1>
        <Dialog
          open={isFileDialogOpen}
          onOpenChange={(isOpen) => {
            setIsFileDialogOpen(isOpen)
            form.reset()
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => {}}>Upload file</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-8">Upload your file.</DialogTitle>
              <DialogDescription>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="file"
                      render={() => (
                        <FormItem>
                          <FormLabel>File</FormLabel>
                          <FormControl>
                            <Input type="file" {...fileRef} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Upload</Button>
                  </form>
                </Form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {files?.map((file) => {
        return <div key={file._id}>{file.name}</div>
      })}
    </main>
  )
}
