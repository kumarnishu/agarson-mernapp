import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


type Context = {
    feature: { feature: string, url: string, icon?: Element } | undefined;
    setFeature: React.Dispatch<React.SetStateAction<{
        feature: string;
        url: string;
        icon?: Element;
    } | undefined>>
};
export const FeatureContext = createContext<Context>({
    feature: undefined,
    setFeature: () => null,
});

export function FeatureProvider(props: { children: JSX.Element }) {
    const naviagte = useNavigate()
    const [feature, setFeature] = useState<{ feature: string, url: string, icon?: Element }>();

    useEffect(() => {
        if (window.location.pathname == "/") {
            setFeature({ feature: "Dashboard", url: window.location.pathname })
            naviagte("/")
        }
    }, [window.location.pathname])
    return (
        <FeatureContext.Provider value={{ feature, setFeature }}>
            {props.children}
        </FeatureContext.Provider>
    );
}
