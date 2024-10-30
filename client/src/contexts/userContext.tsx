import React, { createContext, useState } from "react";
import { GetUserDto } from "../dtos";


// usercontext
type Context = {
  user: GetUserDto | undefined;
  setUser: React.Dispatch<React.SetStateAction<GetUserDto | undefined>>;
};
export const UserContext = createContext<Context>({
  user: undefined,
  setUser: () => null,
});


// user provider
export function UserProvider(props: { children: JSX.Element }) {
  const [user, setUser] = useState<GetUserDto>();
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {props.children}
    </UserContext.Provider>
  );
}

