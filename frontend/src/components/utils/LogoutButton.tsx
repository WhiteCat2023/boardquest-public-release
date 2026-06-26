import { useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

function LogoutButton() {

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const logoutMutation = useMutation({
        mutationFn: async () => {
        const response = await axiosPrivate.post("/auth/logout");
        return response.data;
        }
    });

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
            navigate("/home");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <button onClick={() => handleLogout()} className="text-slate-700 hover:text-slate-900 hover:bg-slate-300 p-2 rounded-md">
            Logout
        </button>
    )
}

export default LogoutButton