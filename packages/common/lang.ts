import { deep } from 'wheater';

export interface ILanguage extends Record<string, string> {

}

export function resetLanguage<T extends ILanguage>(value: T, newValue: Partial<T>) {
    deep.setProps(newValue, value, { skipEmpty: true });
}

export function changeLanguage<T extends ILanguage>(value: T, newValue: T) {
    deep.setProps(newValue, value);
}