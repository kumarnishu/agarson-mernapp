import React, { createContext, useState } from "react";

type Context = {
    articles: string[]
    setArticles: React.Dispatch<React.SetStateAction<string[]>>
};
export const ArticlesContext = createContext<Context>({
    articles: [],
    setArticles: () => null,
});

export function ArticlesProvider(props: { children: JSX.Element }) {
    const [articles, setArticles] = useState<string[]>([]);
    return (
        <ArticlesContext.Provider value={{ articles, setArticles }}>
            {props.children}
        </ArticlesContext.Provider>
    );
}