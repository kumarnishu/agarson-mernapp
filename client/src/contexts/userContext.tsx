import React, { createContext, useEffect, useState } from "react";
import { useQuery } from 'react-query'
import { AxiosResponse } from 'axios'
import { GetProfile } from "../services/UserServices";
import { BackendError } from "..";
import { GetUserDto } from "../dtos/user.dto";

// usercontext
type Context = {
    user: GetUserDto | undefined;
    isLoading: boolean;
    setUser: React.Dispatch<React.SetStateAction<GetUserDto | undefined>>;
};
export const UserContext = createContext<Context>({
    user: undefined,
    isLoading: true,
    setUser: () => null,
});


// user provider
export function UserProvider(props: { children: JSX.Element }) {
    const [user, setUser] = useState<GetUserDto>();
    const { data, isSuccess, isLoading } = useQuery<AxiosResponse<{ user: GetUserDto }>, BackendError>("profile", GetProfile)

    useEffect(() => {
        if (isSuccess && data)
            setUser(data.data.user)
    }, [isSuccess, data])

    return (
        <UserContext.Provider value={{ user, setUser, isLoading }
        }>
            {props.children}
        </UserContext.Provider>
    );
}