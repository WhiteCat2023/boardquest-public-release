import { ArrowRight } from "lucide-react";

function LoginButton({ loginMutation}: { loginMutation: any }) {

    return (
        <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full bg-[#801313] hover:bg-[#680f0f] text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
        >
        <span className="mr-2 text-sm tracking-wide">
            {loginMutation.isPending ? "LOGGING IN..." : "LOG IN"}
        </span>
        <ArrowRight className="h-4 w-4 stroke-[3]" />
        </button>
    );
}

export default LoginButton