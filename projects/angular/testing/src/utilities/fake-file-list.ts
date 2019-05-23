/**
 * A class that implements the `FileList` interface.
 * This class facilitates easy creation of `FileList` mocks, for UTs.
 *
 * @export
 */
export class FakeFileList implements FileList {
    [index: number]: File;

    /**
     * The total file count.
     *
     */
    public get length() {
        return this.files.length;
    }

    /**
     * Creates a `mock` for `FileList` in order to easily test file centric scenarios with `input`s.
     * @param [files=[]] A list of files.
     * @returns The mocked `FileList` instance.
     */
    constructor(public files: File[] = []) {
        files.forEach((file, idx) => {
            this[idx] = file;
        });
    }

    /**
     * Retrieve an item at the specified index.
     *
     * @param idx The accesed index.
     * @returns The file at the requested `idx`.
     */
    public item(idx: number): File {
        return this[idx];
    }

    /**
     * Add files to the collection.
     *
     * @param files The files that will be added to the collection.
     */
    public add(...files: File[]): void {
        files.forEach(file => {
            this[this.files.length] = file;
            this.files.push(file);
        });
    }
}
