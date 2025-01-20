import React, { createContext, useState } from "react";

type Context = {
    party: string | undefined
    setParty: React.Dispatch<React.SetStateAction<string | undefined>>
};
export const PartyContext = createContext<Context>({
    party: undefined,
    setParty: () => null,
});

export function PartyProvider(props: { children: JSX.Element }) {
    const [party, setParty] = useState<string>();
    return (
        <PartyContext.Provider value={{ party, setParty }}>
            {props.children}
        </PartyContext.Provider>
    );
}