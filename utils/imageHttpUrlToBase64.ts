export async function imageHttpUrlToBase64(url: string) {
    try {
        const response = await fetch(url);

        const blob = await response.arrayBuffer();

        const contentType = "image/jpeg"

        const base64String = `data:${contentType};base64,${Buffer.from(
            blob,
        ).toString('base64')}`;

        return base64String;
    } catch (err) {
        console.log(err);
    }
}
