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
import { toast } from "@/hooks/use-toast";
import { Briefcase, ImageIcon } from "lucide-react";
import { useCreateWorkspace } from "@/hooks/workspace/useWorkspace";
import {
  CreateWorkspaceInput,
  createWorkspaceSchema,
} from "../../validators/workspace.validator";

export default function CreateWorkspace() {
  const [workspaceImage, setWorkspaceImage] = useState<File | null>(null);

  const { mutate, isPending } = useCreateWorkspace();

  const form = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: CreateWorkspaceInput) {
    if (!workspaceImage) {
      toast({
        title: "Image required",
        description: "Please upload a workspace image before submitting.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("image", workspaceImage);

    mutate(formData);
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Create New Workspace
          </h1>
          <p className="text-lg text-slate-600">
            Set up a new workspace to organize your projects and collaborate
            with your team
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
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
                {/* Name Field */}
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
                          placeholder="e.g., Marketing Team, Product Design, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Media Section */}
            <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2">
                    <ImageIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Workspace Image</CardTitle>
                    <CardDescription>
                      Upload a representative thumbnail for this workspace
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ImageUploader
                  setImageFile={(file) => {
                    setWorkspaceImage(file);
                  }}
                  title="Upload Workspace Image"
                />
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to cancel? All changes will be lost."
                    )
                  ) {
                    form.reset();
                    setWorkspaceImage(null);
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                variant="default"
                className="min-w-[160px]"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Workspace"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
