import { bucket, bucketName } from "../app";
import { Asset } from "../models/users/user.model";


export const uploadFileToCloud = async (file: string | Buffer, storageFolder: string, filename: string) => {
    let document: Asset | undefined = undefined
    try {
        let tmpName = `${storageFolder}/${Number(new Date())}/${filename}`
        console.log(tmpName)
        let bucketFile = bucket.file(tmpName)
        await bucketFile.save(file)
        if (bucketFile) {
            document = {
                _id: tmpName,
                filename: filename,
                public_url: bucketFile.publicUrl() || "",
                content_type: bucketFile.metadata.contentType || "",
                size: String(bucketFile.metadata.size) || "0",
                bucket: bucketName,
                created_at: new Date()
            }
            return document;
        }
    }
    catch (err) {
        console.log("file uploading server error", err);
        return undefined;
    }
}

