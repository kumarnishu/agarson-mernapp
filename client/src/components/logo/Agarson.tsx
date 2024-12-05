import logo from "../../assets/favicon.png"


type Props = {
    width?: number,
    height?: number,
    title: string
}


export function AgarsonLogo({ width, height, title }: Props) {
    return (
        <>
            <img title={title}
                style={{ width: width, height: height, borderRadius: 10 }}
                alt="img1" src={logo}
            />
        </>
    )
}



export default AgarsonLogo