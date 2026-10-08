/** P7-9 지정 블레이드 모드. 원심 강성화의 개념모형이며 FE/응력/수명 해석 아님. */
import {steadyStateResponse} from '../mck/forced';
export interface BladeMode {frequency0:number;stiffening:number}
export const CAMP_DEFAULT={frequency0:400,stiffening:40,order:12,zeta:.02,rpm:2400};
export const CAMP_MAX_RPM=6000;
function modeCheck(m:BladeMode){if(![m.frequency0,m.stiffening].every(Number.isFinite)||m.frequency0<=0||m.stiffening<0)throw new RangeError('blade mode')}
export function bladeModes(frequency0:number,stiffening:number):BladeMode[]{const m={frequency0,stiffening};modeCheck(m);return [m,{frequency0:1.75*frequency0,stiffening:stiffening/2}]}
export function bladeFrequency(rpm:number,mode:BladeMode){modeCheck(mode);if(!Number.isFinite(rpm)||rpm<0)throw new RangeError('rpm');return Math.hypot(mode.frequency0,Math.sqrt(mode.stiffening)*rpm/60)}
export function orderFrequency(rpm:number,order:number){if(![rpm,order].every(Number.isFinite)||rpm<0||order<=0)throw new RangeError('order');return order*rpm/60}
export function bladeCrossing(mode:BladeMode,order:number,maxRpm=CAMP_MAX_RPM){modeCheck(mode);orderFrequency(0,order);if(!Number.isFinite(maxRpm)||maxRpm<0)throw new RangeError('max rpm');const d=order**2-mode.stiffening;if(d<=0)return {kind:'none' as const,rpm:null,frequency:null};const rpm=60*mode.frequency0/Math.sqrt(d);return {kind:rpm<=maxRpm?'inside' as const:'outside' as const,rpm,frequency:orderFrequency(rpm,order)}}
export function bladeResponse(rpm:number,mode:BladeMode,order:number,zeta:number){if(!Number.isFinite(zeta)||zeta<=0)throw new RangeError('damping');const naturalHz=bladeFrequency(rpm,mode),forcingHz=orderFrequency(rpm,order);return {naturalHz,forcingHz,ratio:forcingHz/naturalHz,...steadyStateResponse(forcingHz/naturalHz,zeta)}}
