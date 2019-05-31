import { FakeFileList } from '../fake-file-list';

/**
 * Defines the structure requried for a file `DropEvent`.
 *
 * @export
 */
export interface IDropEvent extends Event {
    /**
     * Defines the `files` required for file-centric event dispatching.
     *
     */
    dataTransfer: {
        files: FakeFileList,
    };
}
