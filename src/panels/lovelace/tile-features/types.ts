import { AlarmMode } from "../../../data/alarm_control_panel";
import { HvacMode } from "../../../data/climate";
import { ActionConfig } from "../../../data/lovelace";
import { OperationMode } from "../../../data/water_heater";

export interface CoverOpenCloseTileFeatureConfig {
  type: "cover-open-close";
}

export interface CoverPositionTileFeatureConfig {
  type: "cover-position";
}

export interface CoverTiltTileFeatureConfig {
  type: "cover-tilt";
}

export interface CoverTiltPositionTileFeatureConfig {
  type: "cover-tilt-position";
}

export interface LightBrightnessTileFeatureConfig {
  type: "light-brightness";
}

export interface LightColorTempTileFeatureConfig {
  type: "light-color-temp";
}

export interface FanSpeedTileFeatureConfig {
  type: "fan-speed";
}

export interface AlarmModesTileFeatureConfig {
  type: "alarm-modes";
  modes?: AlarmMode[];
}

export interface ClimateHvacModesTileFeatureConfig {
  type: "climate-hvac-modes";
  hvac_modes?: HvacMode[];
}

export interface ClimatePresetModesTileFeatureConfig {
  type: "climate-preset-modes";
  style?: "dropdown" | "icons";
  preset_modes?: string[];
}

export interface SelectOptionsTileFeatureConfig {
  type: "select-options";
  style?: "dropdown" | "buttons";
}

export interface ToggleTileFeatureConfig {
  type: "toggle";
}

export interface ButtonTileFeatureConfig {
  type: "button";
}

export interface UpdateTileFeatureConfig {
  type: "update";
}

export interface MediaControlsTileFeatureConfig {
  type: "media-controls";
  use_extended_controls: boolean;
}

export interface MediaVolumeTileFeatureConfig {
  type: "media-volume";
  style?: "buttons" | "slider";
}

export interface EntityTileFeatureConfig {
  type: "entity";
  entity: string;
  name?: string;
  icon?: string;
  color?: string;
  hide_state?: boolean;
  state_content?: string | string[];
  show_entity_picture?: boolean;
  icon_tap_action?: ActionConfig;
}

export interface DatetimeTileFeatureConfig {
  type: "datetime";
}

export interface NumberTileFeatureConfig {
  type: "number";
  style?: "buttons" | "slider";
}

export interface TextTileFeatureConfig {
  type: "text";
}

export interface TargetTemperatureTileFeatureConfig {
  type: "target-temperature";
}

export interface WaterHeaterOperationModesTileFeatureConfig {
  type: "water-heater-operation-modes";
  operation_modes?: OperationMode[];
}

export const VACUUM_COMMANDS = [
  "start_pause",
  "stop",
  "clean_spot",
  "locate",
  "return_home",
] as const;

export type VacuumCommand = (typeof VACUUM_COMMANDS)[number];

export interface VacuumCommandsTileFeatureConfig {
  type: "vacuum-commands";
  commands?: VacuumCommand[];
}

export const LAWN_MOWER_COMMANDS = ["start_pause", "dock"] as const;

export type LawnMowerCommand = (typeof LAWN_MOWER_COMMANDS)[number];

export interface LawnMowerCommandsTileFeatureConfig {
  type: "lawn-mower-commands";
  commands?: LawnMowerCommand[];
}

export type LovelaceTileFeatureConfig =
  | AlarmModesTileFeatureConfig
  | ClimateHvacModesTileFeatureConfig
  | ClimatePresetModesTileFeatureConfig
  | CoverOpenCloseTileFeatureConfig
  | CoverPositionTileFeatureConfig
  | CoverTiltPositionTileFeatureConfig
  | CoverTiltTileFeatureConfig
  | FanSpeedTileFeatureConfig
  | LawnMowerCommandsTileFeatureConfig
  | LightBrightnessTileFeatureConfig
  | LightColorTempTileFeatureConfig
  | VacuumCommandsTileFeatureConfig
  | TargetTemperatureTileFeatureConfig
  | WaterHeaterOperationModesTileFeatureConfig
  | SelectOptionsTileFeatureConfig
  | ToggleTileFeatureConfig
  | ButtonTileFeatureConfig
  | UpdateTileFeatureConfig
  | MediaControlsTileFeatureConfig
  | MediaVolumeTileFeatureConfig
  | EntityTileFeatureConfig
  | DatetimeTileFeatureConfig
  | NumberTileFeatureConfig
  | TextTileFeatureConfig;

export type LovelaceTileFeatureContext = {
  entity_id?: string;
};
