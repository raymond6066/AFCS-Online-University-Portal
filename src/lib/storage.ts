import { getUrl, remove, uploadData } from "aws-amplify/storage";

export const uploadPrivateFile = async (
  file: File,
  options: { folder: string; access?: "private" | "protected" } = { folder: "uploads", access: "protected" }
) => {
  const accessLevel = options.access ?? "protected";
  const path = `${accessLevel}/${options.folder}/${Date.now()}-${file.name}`;
  const result = await uploadData({
    path,
    data: file,
    options: {
      accessLevel,
      contentType: file.type,
    },
  }).result;

  return result.path;
};

export const getSignedUrl = async (path: string, access: "private" | "protected" = "protected") => {
  const { url } = await getUrl({
    path,
    options: {
      accessLevel: access,
      validateObjectExistence: true,
      expiresIn: 60,
    },
  });
  return url.toString();
};

export const removeFile = async (path: string, access: "private" | "protected" = "protected") => {
  await remove({ path, options: { accessLevel: access } });
};
