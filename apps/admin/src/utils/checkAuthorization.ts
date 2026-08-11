import AxiosInstance from "./AxiosInstance";

export const checkAuthorization = async () => {
    try{
        const response = await AxiosInstance.get("/auth/me");
        if (response.status === 200) {
            const { data } = response;
            console.log("User data:", data);
            return true;
        }  
        console.error("Authorization check failed:", response.statusText);
        return false;

    }catch(error){
        console.error("Error checking authorization:", error);
        
    }
};

