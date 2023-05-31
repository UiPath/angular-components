export const getFileExtension = (fileName: string) => {
    const fileNameParts = fileName.split('.');
    const extension = fileNameParts.length > 1 ? fileNameParts.slice(-1)[0] : '';
    return extension.toUpperCase();
};
