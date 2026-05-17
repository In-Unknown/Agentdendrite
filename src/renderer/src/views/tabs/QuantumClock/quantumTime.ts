export interface QuantumTimeState {
  qt_P: number
  qcs: number
  qis: number
  qats: number
  qks: number
  qrs: number
  qys: number
  qzres: number
  qas: number
  qfs: number
  qps: number
  qns: number
  qμs: number
  qms: number
  qs: number
  qmin: number
  qh: number
  qg: number
  qq: number
  qy: number
  qqc: number
  qwc: number
  qcec: number
  qzc: number
  qhc: number
  qjc: number
  qohc: number
  qomgc: number
}

export interface DailyTimeValues {
  qy: number
  qq: number
  qg: number
  qh: number
  qmin: number
  qs: number
}

export interface MicroTimeValues {
  qms: number
  qμs: number
  qns: number
  qps: number
  qfs: number
}

const QS_IN_SECONDS = 0.5391247
const QMIN_IN_SECONDS = QS_IN_SECONDS * 100
const QH_IN_SECONDS = QMIN_IN_SECONDS * 1000
const QG_IN_SECONDS = QH_IN_SECONDS * 10
const QQ_IN_SECONDS = QG_IN_SECONDS * 10
const QY_IN_SECONDS = QQ_IN_SECONDS * 1000

const QMS_IN_SECONDS = QS_IN_SECONDS / 1000

export function getInitialState(): QuantumTimeState {
  return {
    qt_P: 0,
    qcs: 0,
    qis: 0,
    qats: 0,
    qks: 0,
    qrs: 0,
    qys: 0,
    qzres: 0,
    qas: 0,
    qfs: 0,
    qps: 0,
    qns: 0,
    qμs: 0,
    qms: 0,
    qs: 0,
    qmin: 0,
    qh: 0,
    qg: 1,
    qq: 1,
    qy: 1,
    qqc: 981,
    qwc: 72,
    qcec: 9,
    qzc: 1,
    qhc: 1,
    qjc: 1,
    qohc: 1,
    qomgc: 1
  }
}

export function computeDailyTime(elapsedSeconds: number): DailyTimeValues {
  let remaining = elapsedSeconds

  const qy = Math.floor(remaining / QY_IN_SECONDS)
  remaining -= qy * QY_IN_SECONDS

  const qq = Math.floor(remaining / QQ_IN_SECONDS)
  remaining -= qq * QQ_IN_SECONDS

  const qg = Math.floor(remaining / QG_IN_SECONDS)
  remaining -= qg * QG_IN_SECONDS

  const qh = Math.floor(remaining / QH_IN_SECONDS)
  remaining -= qh * QH_IN_SECONDS

  const qmin = Math.floor(remaining / QMIN_IN_SECONDS)
  remaining -= qmin * QMIN_IN_SECONDS

  const qs = Math.floor(remaining / QS_IN_SECONDS)

  return {
    qy: qy + 1,
    qq: qq + 1,
    qg: qg + 1,
    qh,
    qmin,
    qs
  }
}

export function computeMicroTime(elapsedSeconds: number): MicroTimeValues {
  const totalQms = elapsedSeconds / QMS_IN_SECONDS
  const qms = Math.floor(totalQms) % 1000
  let remaining = (totalQms - Math.floor(totalQms)) * 1000

  const qμs = Math.floor(remaining)
  remaining = (remaining - qμs) * 10000

  const qns = Math.floor(remaining)
  remaining = (remaining - qns) * 1000

  const qps = Math.floor(remaining)
  remaining = (remaining - qps) * 1000

  const qfs = Math.floor(remaining)

  return { qms, qμs, qns, qps, qfs }
}

export function computeTime(initialState: QuantumTimeState, elapsedNs: bigint): QuantumTimeState {
  const elapsedSeconds = Number(elapsedNs) / 1e9

  if (elapsedSeconds <= 0) return { ...initialState }

  const daily = computeDailyTime(elapsedSeconds)
  const micro = computeMicroTime(elapsedSeconds)

  return {
    ...initialState,
    qy: daily.qy,
    qq: daily.qq,
    qg: daily.qg,
    qh: daily.qh,
    qmin: daily.qmin,
    qs: daily.qs,
    qms: micro.qms,
    qμs: micro.qμs,
    qns: micro.qns,
    qps: micro.qps,
    qfs: micro.qfs
  }
}

export function pad(n: number, width: number): string {
  return String(n).padStart(width, '0')
}
