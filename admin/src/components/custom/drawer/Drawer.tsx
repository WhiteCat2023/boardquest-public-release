import { Drawer as DrawerUI, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerContent, } from "../../ui/drawer";

interface DrawerProps {
    triggerButton: React.ReactNode;
    title?: string;
    description?: string;
    children: React.ReactNode;
    showSwipeHandle?: boolean;
}
export default function CustomDrawer({
    triggerButton,
    title,
    description,
    children,
}: DrawerProps) {
    return (
        <DrawerUI>
            <DrawerTrigger asChild>
                {triggerButton}
            </DrawerTrigger>
            <DrawerContent className="p-6 h-fit max-h-[85vh] rounded-t-5xl pb-8">
                <DrawerHeader className="mb-4 p-0">
                    <DrawerTitle className="flex items-center gap-2">
                        {title}
                    </DrawerTitle>
                    <DrawerDescription className="text-start">
                        {description}
                    </DrawerDescription>
                </DrawerHeader>
                <div className="overflow-y-auto max-h-[50vh] pr-1 space-y-4">
                    {children}
                </div>
            </DrawerContent>
        </DrawerUI>
    )
}

