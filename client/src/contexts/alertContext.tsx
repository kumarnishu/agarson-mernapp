import React, { createContext, useState } from "react";

type Alert = {
    message: string,
    color: "error" | "warning" | "success" | "info",
    variant?: "filled" | "outlined"
}
type Context = {
    alert: Alert | undefined;
    setAlert: React.Dispatch<React.SetStateAction<Alert | undefined>>
};
export const AlertContext = createContext<Context>({
    alert: undefined,
    setAlert: () => null,
});

export function AlertProvider(props: { children: JSX.Element }) {
    const [alert, setAlert] = useState<Alert>();
    return (
        <AlertContext.Provider value={{ alert, setAlert }}>
            {props.children}
        </AlertContext.Provider>
    );
}