import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ImageUploader from "@/components/ImageUploader";
import { Briefcase, ImageIcon } from "lucide-react";
import {
  CreateWorkspaceInput,
  createWorkspaceSchema,
} from "../../validators/workspace.validator";
import { useUpdateWorkspace } from "@/hooks/workspace/useWorkspace";

interface EditWorkspaceFormProps {
  workspace: MyWorkSpaces;
}

export function EditWorkspaceForm({ workspace }: EditWorkspaceFormProps) {
  const [workspaceImage, setWorkspaceImage] = useState<File | null>(null);
  const { mutate, isPending } = useUpdateWorkspace(workspace.id);

  const form = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
    },
  });

  function onSubmit(values: CreateWorkspaceInput) {
    const formData = new FormData();
    formData.append("name", values.name);
    if (workspaceImage) formData.append("image", workspaceImage);

    mutate(formData);
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Update Workspace
          </h1>
          <p className="text-lg text-slate-600">
            Edit the name, description, or image of this workspace
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Basic Information</CardTitle>
                    <CardDescription>
                      Workspace name and a brief description
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Workspace Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Marketing Team, Product Design"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2">
                    <ImageIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Workspace Image</CardTitle>
                    <CardDescription>
                      Upload a new image, or leave unchanged
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* pass existing image so uploader can preview it */}
                <ImageUploader
                  setImageFile={(file) => setWorkspaceImage(file)}
                  title="Update Workspace Image"
                  imagePreview={workspace.image ?? undefined}
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="min-w-[160px]"
              >
                {isPending ? "Updating..." : "Update Workspace"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
