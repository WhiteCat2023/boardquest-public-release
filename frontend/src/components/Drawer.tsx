;
import { Drawer as DrawerUI, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerContent, } from "./ui/drawer";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/button";

type DrawerProps = {
    drawerTriggerIcon?: React.ReactNode;
    drawerTitleIcon?: React.ReactNode;
    drawerTriggerName: string;
    drawerDescription: string;
    children: React.ReactNode;
    showSwipeHandle?: boolean;
    buttonClassName: string;
}
export default function CustomDrawer({drawerTriggerIcon, drawerTitleIcon, drawerTriggerName, drawerDescription, children, buttonClassName}: DrawerProps) {
    return (
        <DrawerUI showSwipeHandle>
            <DrawerTrigger asChild>
                <Button className={buttonClassName}>
                    {drawerTriggerIcon}
                    {drawerTriggerName}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="p-6 h-fit max-h-[85vh] rounded-t-5xl pb-8">
                <DrawerHeader className="mb-4 p-0">
                    <DrawerTitle className="flex items-center gap-2">
                        {drawerTitleIcon}
                        {drawerTriggerName}
                    </DrawerTitle>
                    <DrawerDescription className="text-start">
                        {drawerDescription}
                    </DrawerDescription>
                </DrawerHeader>
                <div className="overflow-y-auto max-h-[50vh] pr-1 space-y-4">
                    {children}
                </div>
            </DrawerContent>
        </DrawerUI>
    )
}

