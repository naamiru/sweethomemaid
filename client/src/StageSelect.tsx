import classNames from 'classnames'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode
} from 'react'
import toast from 'react-hot-toast'
import './StageSelect.css'
import { useApp } from './app/use-app'
import { useSetStage } from './app/use-set-stage'
import {
  currentStages,
  isCurrentStageName,
  oldStages,
  type StageName
} from './stages'

type StageType = 'current' | 'old'

export default function StageSelect(): ReactNode {
  const [isLoading, setIsLoading] = useState(false)

  const setStage = useSetStage()
  const changeStage = useCallback(
    (stage: StageName) => {
      setIsLoading(true)
      setStage(stage)
        .catch(e => {
          console.error(e)
          toast.error('ステージの読み込みに失敗しました')
        })
        .finally(() => {
          setIsLoading(false)
        })
    },
    [setStage]
  )

  // 初期ロード
  const { stage } = useApp()
  useEffect(() => {
    changeStage(stage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      changeStage(event.target.value as StageName)
    },
    [changeStage]
  )

  const stageType: StageType = useMemo(
    () => (isCurrentStageName(stage) ? 'current' : 'old'),
    [stage]
  )
  const handleChangeStageType = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const stageType = event.target.value as StageType
      const stage: StageName =
        stageType === 'current' ? currentStages[0] : oldStages[0]
      changeStage(stage)
    },
    [changeStage]
  )

  return (
    <div className="field has-addons stage-select">
      <div className="control">
        <div className="select is-stage-type">
          <select
            name="stageType"
            value={stageType}
            onChange={handleChangeStageType}
          >
            <option value="current">開催中</option>
            <option value="old">終了済</option>
          </select>
        </div>
      </div>
      <div className="control is-expanded">
        <div
          className={classNames('select is-fullwidth', {
            'is-loading': isLoading
          })}
        >
          <select name="stage" value={stage} onChange={handleChange}>
            {stageType === 'current' ? (
              <>
                <optgroup label="マスターズランキング">
                  <option value="masters_25_1">
                    マスターズランキング 3Dプリンター（最下段左が赤）
                  </option>
                  <option value="masters_25_2">
                    マスターズランキング 3Dプリンター（最下段左が紫）
                  </option>
                  <option value="masters_25_3">
                    マスターズランキング 3Dプリンター（最下段左が緑）
                  </option>
                </optgroup>
                <optgroup label="第2回チームズランキング ピーナッツ">
                  <option value="teamsrank_2">チームズランキング</option>
                </optgroup>
              </>
            ) : (
              <>
                <optgroup label="第24回マスターズランキング">
                  <option value="masters_24_1">
                    マスターズランキング 氷（左下が紫）
                  </option>
                  <option value="masters_24_2">
                    マスターズランキング 氷（左下が赤）
                  </option>
                  <option value="masters_24_3">
                    マスターズランキング 氷（左下が黄）
                  </option>
                </optgroup>
                <optgroup label="第1回チームズランキング ダンボール箱">
                  <option value="teamsrank_1">チームズランキング</option>
                </optgroup>
                <optgroup label="第23回マスターズランキング">
                  <option value="masters_23_1">
                    マスターズランキング 泡（左下が黄）
                  </option>
                  <option value="masters_23_2">
                    マスターズランキング 泡（左下が緑）
                  </option>
                  <option value="masters_23_3">
                    マスターズランキング 泡（左下が赤）
                  </option>
                </optgroup>
                <optgroup label="第5回チームズフェスティバル">
                  <option value="teams_5_1">チームフェス phase1</option>
                  <option value="teams_5_2">チームフェス phase2</option>
                  <option value="teams_5_3">チームフェス phase3</option>
                </optgroup>
                <optgroup label="春の駅弁祭り">
                  <option value="ekiben_4">春の駅弁祭り4</option>
                </optgroup>
                <optgroup label="第21回マスターズランキング">
                  <option value="masters_21_1">
                    マスターズ みかん箱（最上段左が紫）
                  </option>
                  <option value="masters_21_2">
                    マスターズ みかん箱（最上段左が青）
                  </option>
                  <option value="masters_21_3">
                    マスターズ みかん箱（最上段左が緑）
                  </option>
                </optgroup>
                <optgroup label="第20回マスターズランキング ボタン">
                  <option value="masters_20_1">
                    マスターズ ボタン（最上段左が青）
                  </option>
                  <option value="masters_20_2">
                    マスターズ ボタン（最上段左が赤）
                  </option>
                  <option value="masters_20_3">
                    マスターズ ボタン（最上段左が黄）
                  </option>
                </optgroup>
                <optgroup label="第19回マスターズランキング ゼリー">
                  <option value="masters_19_1">
                    マスターズ ゼリー（右上が青）
                  </option>
                  <option value="masters_19_2">
                    マスターズ ゼリー（右上が紫）
                  </option>
                  <option value="masters_19_3">
                    マスターズ ゼリー（右上が水）
                  </option>
                </optgroup>
                <optgroup label="黄金のたまごを探せ！">
                  <option value="easter_1">黄金のたまごを探せ！1</option>
                  <option value="easter_2">黄金のたまごを探せ！2</option>
                  <option value="easter_3">黄金のたまごを探せ！3</option>
                  <option value="easter_4_1">
                    黄金のたまごを探せ！4 wave1
                  </option>
                  <option value="easter_4_2">
                    黄金のたまごを探せ！4 wave2
                  </option>
                  <option value="easter_5">黄金のたまごを探せ！5</option>
                  <option value="easter_7">黄金のたまごを探せ！7</option>
                </optgroup>
                <optgroup label="第18回マスターズランキング プレゼント箱">
                  <option value="masters_18_1">
                    マスターズ プレゼント箱（左上が赤）
                  </option>
                  <option value="masters_18_2">
                    マスターズ プレゼント箱（左上が黄）
                  </option>
                  <option value="masters_18_3">
                    マスターズ プレゼント箱（左上が紫）
                  </option>
                </optgroup>
                <optgroup label="第4回チームズフェスティバル">
                  <option value="teams_4_1">チームフェス phase1</option>
                </optgroup>
                <optgroup label="第17回マスターズランキング 鎖">
                  <option value="masters_17_1">
                    マスターズ 鎖（右下が水）
                  </option>
                  <option value="masters_17_2">
                    マスターズ 鎖（右下が紫）
                  </option>
                  <option value="masters_17_3">
                    マスターズ 鎖（右下が赤）
                  </option>
                </optgroup>
                <optgroup label="第16回マスターズランキング 薪">
                  <option value="masters_16_1">
                    マスターズ 薪（最下段右が青）
                  </option>
                  <option value="masters_16_2">
                    マスターズ 薪（最下段右が水）
                  </option>
                  <option value="masters_16_3">
                    マスターズ 薪（最下段右が緑）
                  </option>
                </optgroup>
                <optgroup label="第15回マスターズランキング ネズミ">
                  <option value="masters_15_1">
                    マスターズ ネズミ（左上が黄）
                  </option>
                  <option value="masters_15_2">
                    マスターズ ネズミ（左上が赤）
                  </option>
                  <option value="masters_15_3">
                    マスターズ ネズミ（左上が紫）
                  </option>
                </optgroup>
                <optgroup label="チョコパラダイス">
                  <option value="valentine_1">チョコパラダイス1</option>
                  <option value="valentine_2_1">チョコパラダイス2 wave1</option>
                  <option value="valentine_2_2">チョコパラダイス2 wave2</option>
                  <option value="valentine_3">チョコパラダイス3</option>
                  <option value="valentine_4_1">チョコパラダイス4 wave1</option>
                  <option value="valentine_4_2">チョコパラダイス4 wave2</option>
                  <option value="valentine_4_3">チョコパラダイス4 wave3</option>
                  <option value="valentine_5_1">チョコパラダイス5 wave1</option>
                  <option value="valentine_5_2">チョコパラダイス5 wave2</option>
                  <option value="valentine_5_3">チョコパラダイス5 wave3</option>
                  <option value="valentine_5_4">チョコパラダイス5 wave4</option>
                  <option value="valentine_10">チョコパラダイス10</option>
                </optgroup>
                <optgroup label="第14回マスターズランキング ピーナッツ">
                  <option value="masters_14_1">
                    マスターズ ピーナッツ（上段左が黄）
                  </option>
                  <option value="masters_14_2">
                    マスターズ ピーナッツ（上段左が水）
                  </option>
                  <option value="masters_14_3">
                    マスターズ ピーナッツ（上段左が赤）
                  </option>
                </optgroup>
                <optgroup label="第3回チームズフェスティバル">
                  {/* 空のゼリーの処理に問題あり
                  <option value="teams_3_1_1">チームフェス phase1 wave1</option>
                  <option value="teams_3_1_2">チームフェス phase1 wave2</option>
                  */}
                  <option value="teams_3_2">チームフェス phase2</option>
                </optgroup>
                <optgroup label="第13回マスターズランキング ダンボール箱">
                  <option value="masters_13_1">
                    マスターズ ダンボール（左上が紫）
                  </option>
                  <option value="masters_13_2">
                    マスターズ ダンボール（左上が水）
                  </option>
                  <option value="masters_13_3">
                    マスターズ ダンボール（左上が青）
                  </option>
                </optgroup>
                <optgroup label="第12回マスターズランキング 3Dプリンター">
                  <option value="masters_12_1">
                    マスターズ 3Dプリンター（左下が黄）
                  </option>
                  <option value="masters_12_2">
                    マスターズ 3Dプリンター（左下が赤）
                  </option>
                  <option value="masters_12_3">
                    マスターズ 3Dプリンター（左下が青）
                  </option>
                </optgroup>
                <optgroup label="第11回マスターズランキング 氷">
                  <option value="masters_11_1">
                    マスターズ 氷（右上が紫）
                  </option>
                  <option value="masters_11_2">
                    マスターズ 氷（右上が黄）
                  </option>
                  <option value="masters_11_3">
                    マスターズ 氷（右上が青）
                  </option>
                </optgroup>
                <optgroup label="第10回マスターズランキング 泡">
                  <option value="masters_10_1">
                    マスターズ 泡（右下が黄）
                  </option>
                  <option value="masters_10_2">
                    マスターズ 泡（右下が水）
                  </option>
                  <option value="masters_10_3">
                    マスターズ 泡（右下が青）
                  </option>
                </optgroup>
                <optgroup label="ズボラ姫たちの年はじめ">
                  <option value="newyear_1_1">年はじめ1 wave1</option>
                  <option value="newyear_1_2">年はじめ1 wave2</option>
                  <option value="newyear_2">年はじめ2</option>
                  <option value="newyear_3">年はじめ3</option>
                  <option value="newyear_4_1">年はじめ4 wave1</option>
                  <option value="newyear_4_2">年はじめ4 wave2</option>
                  <option value="newyear_5_1">年はじめ5 wave1</option>
                  <option value="newyear_5_2">年はじめ5 wave2</option>
                  <option value="newyear_6_1">年はじめ6 wave1</option>
                  <option value="newyear_6_2">年はじめ6 wave2</option>
                  <option value="newyear_7">年はじめ7</option>
                  <option value="newyear_8_1">年はじめ8 wave1</option>
                  <option value="newyear_8_2">年はじめ8 wave2</option>
                  {/* 落下処理が無限ループする
                  <option value="newyear_9_1">年はじめ9 wave1</option>
                  <option value="newyear_9_2">年はじめ9 wave2</option>
                  */}
                  <option value="newyear_10_1">年はじめ10 wave1</option>
                  <option value="newyear_10_2">年はじめ10 wave2</option>
                </optgroup>
                <optgroup label="第2回チームズフェスティバル">
                  <option value="teams_2_1">チームフェス phase1</option>
                  <option value="teams_2_2">チームフェス phase2</option>
                  <option value="teams_2_3">チームフェス phase3</option>
                </optgroup>
                <optgroup label="第9回マスターズランキング 蜘蛛の巣">
                  <option value="masters_9_2">
                    マスターズ 蜘蛛の巣（中央が緑）
                  </option>
                  <option value="masters_9_3">
                    マスターズ 蜘蛛の巣（中央が赤）
                  </option>
                  <option value="masters_9_1">
                    マスターズ 蜘蛛の巣（中央が紫）
                  </option>
                </optgroup>
                <optgroup label="第8回マスターズランキング みかん箱">
                  <option value="masters_8_1">
                    マスターズ みかん箱（右上が緑）
                  </option>
                  <option value="masters_8_2">
                    マスターズ みかん箱（右上が水）
                  </option>
                  <option value="masters_8_3">
                    マスターズ みかん箱（右上が黄）
                  </option>
                </optgroup>
                <optgroup label="第7回マスターズランキング ボタン">
                  <option value="masters_7_1">
                    マスターズ ボタン（中央上が紫）
                  </option>
                  <option value="masters_7_2">
                    マスターズ ボタン（中央上が水色）
                  </option>
                </optgroup>
                <optgroup label="第6回マスターズランキング ゼリー">
                  <option value="masters_6_1">
                    マスターズ ゼリー（中央下が緑）
                  </option>
                  <option value="masters_6_2">
                    マスターズ ゼリー（中央下が水色）
                  </option>
                  <option value="masters_6_3">
                    マスターズ ゼリー（中央下が青）
                  </option>
                </optgroup>
                <optgroup label="第5回マスターズランキング プレゼント箱">
                  <option value="masters_5_1">
                    マスターズ プレゼント ロ型
                  </option>
                  <option value="masters_5_2">マスターズ プレゼント C型</option>
                  <option value="masters_5_3">
                    マスターズ プレゼント 目型
                  </option>
                </optgroup>
                <optgroup label="第1回チームズフェスティバル">
                  <option value="teams_1_1_1">チームフェス phase1 wave1</option>
                  <option value="teams_1_1_2">チームフェス phase1 wave2</option>
                  <option value="teams_1_1_3">チームフェス phase1 wave3</option>
                  <option value="teams_1_2">チームフェス phase2</option>
                  <option value="teams_1_3_1">チームフェス phase3 wave1</option>
                  <option value="teams_1_3_2">チームフェス phase3 wave2</option>
                  <option value="teams_1_3_3">チームフェス phase3 wave3</option>
                </optgroup>
                <optgroup label="第4回マスターズランキング 鎖">
                  <option value="masters_4_1">マスターズ 鎖 O型</option>
                  <option value="masters_4_2">マスターズ 鎖 /型</option>
                  <option value="masters_4_3">マスターズ 鎖 X型</option>
                </optgroup>
                <optgroup label="クリスマス・メイキング">
                  <option value="xmas_1">クリスマス1</option>
                  <option value="xmas_2_1">クリスマス2 wave1</option>
                  <option value="xmas_2_2">クリスマス2 wave2</option>
                  <option value="xmas_4_1">クリスマス4 wave1</option>
                  <option value="xmas_4_2">クリスマス4 wave2</option>
                  <option value="xmas_5">クリスマス5</option>
                  <option value="xmas_7">クリスマス7</option>
                  <option value="xmas_8">クリスマス8</option>
                  <option value="xmas_9">クリスマス9</option>
                  <option value="xmas_10_1">クリスマス10 wave1</option>
                  <option value="xmas_10_2">クリスマス10 wave2</option>
                </optgroup>
                <optgroup label="第3回マスターズランキング 薪">
                  <option value="masters_3_1">マスターズ 薪 エ型</option>
                  <option value="masters_3_2">マスターズ 薪 ロ型</option>
                  <option value="masters_3_3">マスターズ 薪 C型</option>
                </optgroup>
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  )
}
