import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CustomDialogProps {
  triggerButton: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomDialog({
  triggerButton,
  title,
  description,
  open,
  onOpenChange,
  children
}: CustomDialogProps) {
  return (
            <Dialog open={open} onOpenChange={onOpenChange}>
              <DialogTrigger asChild>
                {triggerButton}
              </DialogTrigger>
              <DialogContent className="sm:max-w-md p-6 rounded-2xl">
                <DialogHeader className="mb-2">
                  <DialogTitle className="text-lg font-bold text-gray-800">
                    {title}
                  </DialogTitle>
                  <DialogDescription>
                    {description}
                  </DialogDescription>
                </DialogHeader>
                {children}
              </DialogContent>
            </Dialog>
    );
}