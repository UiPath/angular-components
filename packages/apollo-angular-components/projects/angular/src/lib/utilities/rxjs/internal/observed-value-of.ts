import { ObservableInput } from 'rxjs';

export type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;
