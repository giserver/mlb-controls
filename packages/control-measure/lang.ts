import { ILanguage, units } from '@mlb-controls/common';

type TUnitsLanguage = {
    [k in units.TUnitsArea]: string
} & {
        [k in units.TUnitsLength]: string
    }

export interface IMeasureControlLanguage extends ILanguage, TUnitsLanguage {
    ending: string,
}