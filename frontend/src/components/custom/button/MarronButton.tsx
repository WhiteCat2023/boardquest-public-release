import React from "react"
import { Button } from "../../ui/button"

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
                size="lg"
                onClick={onClick}
                className={`${className} bg-[#A70202] text-white hover:bg-white hover:text-[#A70202] hover:border-[#A70202] cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-150`}
                {...rest}
            >
                {children ? children : (
                    <>
                        {icon && <span>{icon}</span>}
                        {label}
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