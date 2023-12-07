import { sort } from '@uipath/angular/utilities';

export const sortAndFilter = (files: File[], sortBy: string | undefined, accept: string[]) => {
    files = files.filter(f => isAcceptedExtension(f.name, accept));
    return sortBy ? sort(files, sortBy, false) : files;
};

const isAcceptedExtension = (fileName: string, accept: string[]) => {
    if (!accept.length) {
        return true;
    }

    const fileExtension = getFileExtension(fileName);
    return accept.includes(fileExtension);
};

const getFileExtension = (fileName: string) => {
    const fileNameParts = fileName.split('.');
    const extension = fileNameParts.length > 1 ? fileNameParts.slice(-1)[0] : '';
    return `.${extension.toLowerCase()}`;
};

