// Application Companion Android : `discharging` veut dire débranchée.
// `not_charging` (branchée, charge en pause) est normal sur une tablette murale.
export const isUnplugged = (batteryState: string) =>
  batteryState === 'discharging';
