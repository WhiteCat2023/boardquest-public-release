import useAuth from "@/hooks/useAuth";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

export default function UserProfileWidget() {
  const { auth } = useAuth();

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end hidden sm:flex">
        <span className="text-xs font-bold text-slate-800 leading-tight">
          {(auth as any)?.data?.user?.name || "User Name"}
        </span>
        <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
          {(auth as any)?.data?.user?.email || "user@example.com"}
        </span>
      </div>
      <Avatar className="h-9 w-9 border border-slate-100 shadow-xs cursor-pointer">
        <AvatarImage src="" alt={(auth as any)?.data?.user?.name} />
        <AvatarFallback className="bg-red-50 text-[#A70202] font-semibold text-xs">
          {(auth as any)?.data?.user?.name
            ? (auth as any).data.user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "U"}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
