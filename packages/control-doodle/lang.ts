import { ILanguage } from '@mlb-controls/common';

export interface IDoodleContorlLanguage extends ILanguage {
    name: string,
    re_draw: string,
    exit : string
}