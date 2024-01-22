import { type BoardConfig } from '@sweethomemaid/logic'

export const currentStages = [
  'teams_2_1',
  'teams_2_2',
  'masters_9_1',
  'masters_9_2',
  'masters_9_3',
  'newyear_1_1',
  'newyear_1_2',
  'newyear_2',
  'newyear_3',
  'newyear_4_1',
  'newyear_4_2',
  'newyear_5_1',
  'newyear_5_2',
  'newyear_6_1',
  'newyear_6_2',
  'newyear_7',
  'newyear_8_1',
  'newyear_8_2',
  'newyear_9_1',
  'newyear_9_2',
  'newyear_10_1',
  'newyear_10_2'
] as const
export const oldStages = [
  'masters_8_1',
  'masters_8_2',
  'masters_8_3',
  'masters_7_1',
  'masters_7_2',
  'masters_6_1',
  'masters_6_2',
  'masters_6_3',
  'masters_5_1',
  'masters_5_2',
  'masters_5_3',
  'teams_1_1_1',
  'teams_1_1_2',
  'teams_1_1_3',
  'teams_1_2',
  'teams_1_3_1',
  'teams_1_3_2',
  'teams_1_3_3',
  'masters_4_1',
  'masters_4_2',
  'masters_4_3',
  'xmas_1',
  'xmas_2_1',
  'xmas_2_2',
  'xmas_4_1',
  'xmas_4_2',
  'xmas_5',
  'xmas_7',
  'xmas_8',
  'xmas_9',
  'xmas_10_1',
  'xmas_10_2',
  'masters_3_1',
  'masters_3_2',
  'masters_3_3'
] as const

export const stages = [...currentStages, ...oldStages] as const
export type StageName = (typeof stages)[number]

export type CurrentStageName = (typeof currentStages)[number]
const currentConfigs = import.meta.glob<true, string, BoardConfig>(
  './current/*.ts',
  { import: 'default', eager: true }
)

export function isCurrentStageName(name: StageName): name is CurrentStageName {
  return (currentStages as readonly string[]).includes(name)
}

export function getCurrentStageConfig(stage: CurrentStageName): BoardConfig {
  return currentConfigs[`./current/${stage}.ts`]
}

export async function getStageConfig(stage: StageName): Promise<BoardConfig> {
  if (isCurrentStageName(stage)) return getCurrentStageConfig(stage)
  return (await import(`./old/${stage}.ts`)).default
}
