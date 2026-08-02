import { useContext } from 'react';
import AuthContext, { type AuthContextType } from '@/context/AuthProvider';

const useAuth = (): AuthContextType => {
    return useContext(AuthContext);
}

export default useAuth;