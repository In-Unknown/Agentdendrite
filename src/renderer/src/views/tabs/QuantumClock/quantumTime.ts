import type { QuantumTimeState } from './quantumTimeTypes'
import Decimal from 'decimal.js'
import csvRaw from './Conversion.csv?raw'

Decimal.set({ precision: 180 })

// 开机时刻的纳秒时间戳：Date.now()毫秒转纳秒 - 当前系统运行纳秒数
const BOOT_EPOCH_NS = BigInt(Date.now()) * 1_000_000n - process.hrtime.bigint()

// 读取 Conversion.csv 并解析为对象数组
const CONVERSION_TABLE = csvRaw
  .trim()
  .split('\n')
  .slice(1)
  .map((line) => {
    const [UnitName_CN, Symbol, Type, ValueRange, PlanckTimeMultiplier, BaseRate, ExactMetricTime] =
      line.split(',')
    return {
      UnitName_CN,
      Symbol,
      Type,
      ValueRange,
      PlanckTimeMultiplier,
      BaseRate,
      ExactMetricTime: ExactMetricTime.replace(/\r$/, '')
    }
  })

const BIG_BANG_PLANCK_TIME = new Decimal('8.07198e60')
const PLANCK_PER_SECOND = new Decimal('368277192000').div(
  new Decimal(CONVERSION_TABLE[0].ExactMetricTime.replace(' s', ''))
)

export function getTickTime(state: QuantumTimeState): void {
  const at_P = BIG_BANG_PLANCK_TIME.plus(PLANCK_PER_SECOND).plus(
    new Decimal(BOOT_EPOCH_NS + process.hrtime.bigint())
      .times(new Decimal('1e-9'))
      .div(new Decimal(CONVERSION_TABLE[0].ExactMetricTime.replace(' s', '')))
  )

  let remainder = at_P

  for (let i = CONVERSION_TABLE.length - 1; i >= 0; i--) {
    const row = CONVERSION_TABLE[i]
    const symbol = row.Symbol as keyof QuantumTimeState

    let current: Decimal
    if (i === CONVERSION_TABLE.length - 1) {
      current = remainder.div(new Decimal(row.PlanckTimeMultiplier))
    } else {
      current = remainder.times(new Decimal(row.BaseRate))
    }

    const intPart = current.floor()
    state[symbol] = row.Type === '序号' ? intPart.plus(1).toNumber() : intPart.toNumber()
    remainder = current.minus(intPart)
  }
}

export function getInitialState(): QuantumTimeState {
  const state = {} as QuantumTimeState
  for (const row of CONVERSION_TABLE) {
    ;(state as unknown as Record<string, number>)[row.Symbol] = 0
  }
  return state
}

export function pad(n: number, width: number): string {
  return String(n).padStart(width, '0')
}
