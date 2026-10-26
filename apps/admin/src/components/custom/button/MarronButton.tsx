import React from "react"
import { Button } from "@/components/ui/button"

interface MarronButtonProps {
    icon?: React.ReactNode;
    label?: string;
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
}

class MarronButtonInner extends React.Component<MarronButtonProps & { forwardedRef?: React.Ref<HTMLButtonElement> }> {
    render() {
        const { icon, label, onClick, className, children, forwardedRef, ...rest } = this.props;

        return (
            <Button
                ref={forwardedRef}
                variant="outline"
                onClick={onClick}
                className={`bg-[#A70202] text-white hover:bg-white hover:text-[#A70202] hover:border-[#A70202] cursor-pointer flex items-center gap-1.5 px-3.5 h-9 text-xs font-semibold rounded-xl transition-all duration-150 shadow-xs ${className || ""}`}
                {...rest}
            >
                {children ? children : (
                    <>
                        {icon && <span className="shrink-0">{icon}</span>}
                        <span>{label}</span>
                    </>
                )}
            </Button>
        );
    }
}

// Wrap the class component in forwardRef to support Radix/shadcn triggers (like DropdownMenuTrigger)
const MarronButton = React.forwardRef<HTMLButtonElement, MarronButtonProps>((props, ref) => (
    <MarronButtonInner {...props} forwardedRef={ref} />
));

export default MarronButton;