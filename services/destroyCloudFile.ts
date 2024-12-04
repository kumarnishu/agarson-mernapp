import { bucket } from "../app";

export const destroyCloudFile = async (id: string) => {
  try {
    let bucketFile = bucket.file(id)
    await bucketFile.delete()
  } catch (error) {
    console.log("could not file may be not available in server", error);
  }
}


