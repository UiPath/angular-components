export class FakeFileList implements FileList {
    [index: number]: File;

    public get length() {
        return this.files.length;
    }

    constructor(public files: File[] = []) {
        files.forEach((file, idx) => {
            this[idx] = file;
        });
    }

    public item(index: number) {
        return this[index];
    }

    public add(...files: File[]) {
        files.forEach(file => {
            this[this.files.length] = file;
            this.files.push(file);
        });
    }
}
