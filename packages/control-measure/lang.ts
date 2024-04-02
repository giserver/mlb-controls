import { ILanguage, units } from '@giserver/common';

type TUnitsLanguage = {
    [k in units.TUnitsArea]: string
} & {
        [k in units.TUnitsLength]: string
    }

export interface IMeasureControlLanguage extends ILanguage, TUnitsLanguage {
    ending: string,
}