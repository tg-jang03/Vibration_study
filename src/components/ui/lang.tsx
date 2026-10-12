/**
 * 랩 화면의 언어 (D-054). 랩이 LabFrame에 lang을 넘기면 그 안의 공용 UI(읽음값 표·재생 막대·플롯 등)가
 * 이 문맥으로 자기 문구를 고른다. 문맥 밖(기본)은 한국어.
 */
import { createContext, useContext } from 'react';
import type { Lang } from '../../i18n';
import { UI, type UiStrings } from '../../i18n/ui';

export const LangContext = createContext<Lang>('ko');
export const useLang = (): Lang => useContext(LangContext);
export const useUi = (): UiStrings => UI[useContext(LangContext)];
