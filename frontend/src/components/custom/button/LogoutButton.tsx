import useAuth from "../../../hooks/useAuth";

function LogoutButton() {
    const { logout } = useAuth();

    return (
        <button onClick={logout} className="text-slate-700 hover:text-slate-900 hover:bg-slate-300 p-2 rounded-md">
            Logout
        </button>
    )
}

export default LogoutButton