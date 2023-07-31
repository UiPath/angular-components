export class SettingsStore<TStoredObject> {
    private _storageKey: string;

    constructor(
        storageKey: string,
    ) {
        this._storageKey = storageKey;
    }

    get(): Partial<TStoredObject> {
        try {
            const storedObject = localStorage.getItem(this._storageKey) ?? '{}';
            return JSON.parse(storedObject);
        } catch {
            return {};
        }
    }

    store(settings: TStoredObject) {
        localStorage.setItem(this._storageKey, JSON.stringify(settings));
    }
}
